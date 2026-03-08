import { useState, useEffect, useMemo } from 'react';
import { Radar, Loader2, Star } from 'lucide-react';
import { Header } from './components/Header';
import { OpportunityCard } from './components/OpportunityCard';
import { OpportunityModal } from './components/OpportunityModal';
import { FavoritesPage } from './pages/FavoritesPage';
import { PricingPage } from './pages/PricingPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AlertsPage } from './pages/AlertsPage';
import { DatabasePage } from './pages/DatabasePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { Opportunity } from './types/opportunity';
import { supabase } from './lib/supabase';
import { mockOpportunities, generateNewOpportunity } from './lib/mockData';
import { generateOpportunityWithAI } from './lib/openai';
import { useAuth } from './contexts/AuthContext';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'favorites' | 'pricing' | 'leaderboard' | 'alerts' | 'database' | 'projects'>('home');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const { refreshProfile } = useAuth();

  const topOpportunities = useMemo(() => {
    return opportunities.filter(opp => opp.opportunity_score >= 80);
  }, [opportunities]);

  const regularOpportunities = useMemo(() => {
    return opportunities.filter(opp => opp.opportunity_score < 80);
  }, [opportunities]);

  useEffect(() => {
    loadOpportunities();

    // Check for checkout success and refresh profile
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      // Poll for subscription updates since webhook might take time
      let pollCount = 0;
      const maxPolls = 10;
      const pollInterval = setInterval(() => {
        refreshProfile();
        pollCount++;
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
        }
      }, 2000);

      // Clean up URL
      window.history.replaceState({}, '', '/');

      return () => clearInterval(pollInterval);
    }
  }, []);

  async function loadOpportunities() {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        await seedInitialData();
      } else {
        setOpportunities(data);
      }
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  }

  async function seedInitialData() {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .insert(mockOpportunities)
        .select();

      if (error) throw error;
      if (data) {
        setOpportunities(data);
      }
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  }

  async function scanTrends() {
    setScanning(true);

    try {
      const batchId = crypto.randomUUID();
      const newOpportunities = [];

      for (let i = 0; i < 5; i++) {
        let newOpportunity;

        try {
          newOpportunity = await generateOpportunityWithAI();
          newOpportunity.scan_batch_id = batchId;
        } catch (aiError) {
          console.warn('AI generation failed, using mock data:', aiError);
          newOpportunity = generateNewOpportunity();
          newOpportunity.scan_batch_id = batchId;
        }

        newOpportunities.push(newOpportunity);
      }

      const { data, error } = await supabase
        .from('opportunities')
        .insert(newOpportunities)
        .select();

      if (error) throw error;

      if (data) {
        setOpportunities(prev => [...data, ...prev]);
      }
    } catch (error) {
      console.error('Error scanning trends:', error);
      alert('Failed to generate opportunities. Please check your OpenAI API key in the .env file.');
    } finally {
      setScanning(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (currentPage === 'favorites') {
    return (
      <>
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />
        <FavoritesPage onNavigateHome={() => setCurrentPage('home')} />
      </>
    );
  }

  if (currentPage === 'pricing') {
    return (
      <>
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />
        <PricingPage />
      </>
    );
  }

  if (currentPage === 'leaderboard') {
    return (
      <>
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />
        <LeaderboardPage
          onNavigateHome={() => setCurrentPage('home')}
          onSelectOpportunity={setSelectedOpportunity}
        />
        {selectedOpportunity && (
          <OpportunityModal
            opportunity={selectedOpportunity}
            onClose={() => setSelectedOpportunity(null)}
            onUpgradeClick={() => setCurrentPage('pricing')}
          />
        )}
      </>
    );
  }

  if (currentPage === 'alerts') {
    return (
      <>
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />
        <AlertsPage />
      </>
    );
  }

  if (currentPage === 'database') {
    return (
      <>
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />
        <DatabasePage
          onNavigateHome={() => setCurrentPage('home')}
          onUpgradeClick={() => setCurrentPage('pricing')}
        />
      </>
    );
  }

  if (currentPage === 'projects') {
    return (
      <>
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />
        <ProjectsPage />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-6">
            Turn real trends into validated startup opportunities
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Discover market signals, find customers, and generate a startup launch plan in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={scanTrends}
              disabled={scanning}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-lg font-semibold w-full sm:w-auto"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Radar className="w-5 h-5" />
                  <span>Scan Trends</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (opportunities.length > 0) {
                  setSelectedOpportunity(opportunities[0]);
                } else {
                  scanTrends();
                }
              }}
              className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 rounded-xl hover:border-gray-400 dark:hover:border-gray-600 transition-all shadow-lg hover:shadow-xl text-lg font-semibold w-full sm:w-auto"
            >
              <Star className="w-5 h-5" />
              <span>Generate Startup Plan</span>
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto text-left">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Trend Detection
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover emerging opportunities from real market signals
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">2</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Validation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analyze competition and validate market demand
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">3</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Customer Discovery
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Find where your potential customers already are
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">4</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Startup Launch
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Build and launch with a clear 30-day roadmap
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Business Opportunities
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Executable startup ideas based on global trends
              </p>
              {opportunities.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {opportunities.length} startup {opportunities.length === 1 ? 'opportunity' : 'opportunities'} generated from real trend signals
                </p>
              )}
            </div>
          </div>

          {opportunities.length === 0 ? (
            <div className="text-center py-12">
              <Radar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No opportunities yet. Click "Scan Trends" to discover new ideas!
              </p>
            </div>
          ) : (
            <>
              {topOpportunities.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg shadow-lg">
                      <Star className="w-5 h-5 fill-current" />
                      <h3 className="text-lg font-bold">Top Opportunities</h3>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {topOpportunities.length} high-potential {topOpportunities.length === 1 ? 'opportunity' : 'opportunities'} found
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur-xl"></div>
                    <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-amber-500/30 dark:border-orange-500/30 rounded-2xl p-6 shadow-xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {topOpportunities.map((opportunity, index) => (
                          <div key={opportunity.id} className="relative">
                            <OpportunityCard
                              opportunity={opportunity}
                              onClick={() => setSelectedOpportunity(opportunity)}
                              isTopOpportunity={index === 0}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {regularOpportunities.length > 0 && (
                <div>
                  {topOpportunities.length > 0 && (
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      All Opportunities
                    </h3>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {regularOpportunities.map((opportunity) => (
                      <OpportunityCard
                        key={opportunity.id}
                        opportunity={opportunity}
                        onClick={() => setSelectedOpportunity(opportunity)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {selectedOpportunity && (
        <OpportunityModal
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          onUpgradeClick={() => setCurrentPage('pricing')}
        />
      )}
    </div>
  );
}

export default App;

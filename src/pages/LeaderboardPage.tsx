import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Eye, Share2, Star, ArrowLeft } from 'lucide-react';
import { Opportunity } from '../types/opportunity';
import { OpportunityCard } from '../components/OpportunityCard';
import { supabase } from '../lib/supabase';

interface LeaderboardPageProps {
  onNavigateHome: () => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
}

type SortOption = 'trend_score' | 'views' | 'shares';

export function LeaderboardPage({ onNavigateHome, onSelectOpportunity }: LeaderboardPageProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('trend_score');

  useEffect(() => {
    loadLeaderboard();
  }, [sortBy]);

  async function loadLeaderboard() {
    try {
      setLoading(true);

      let query = supabase
        .from('opportunities')
        .select(`
          *,
          opportunity_stats (
            view_count,
            share_count
          )
        `);

      switch (sortBy) {
        case 'trend_score':
          query = query.order('trend_score', { ascending: false, nullsFirst: false });
          break;
        case 'views':
          query = query.order('opportunity_stats(view_count)', { ascending: false });
          break;
        case 'shares':
          query = query.order('opportunity_stats(share_count)', { ascending: false });
          break;
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;

      setOpportunities(data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Top Opportunities
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                The most promising startup ideas ranked by trend score, views, and shares
              </p>
            </div>
          </div>

          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setSortBy('trend_score')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === 'trend_score'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Highest Score</span>
            </button>

            <button
              onClick={() => setSortBy('views')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === 'views'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Most Viewed</span>
            </button>

            <button
              onClick={() => setSortBy('shares')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === 'shares'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Most Shared</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No opportunities yet. Be the first to discover trends!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {opportunities.map((opportunity, index) => (
              <div key={opportunity.id} className="relative">
                {index < 3 && (
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-10">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                )}
                <OpportunityCard
                  opportunity={opportunity}
                  onClick={() => onSelectOpportunity(opportunity)}
                  isTopOpportunity={index === 0}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

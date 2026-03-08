import { useState, useEffect, useMemo } from 'react';
import { Database, Search, Filter, TrendingUp, Eye, Share2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Opportunity } from '../types/opportunity';
import { OpportunityCard } from '../components/OpportunityCard';
import { OpportunityModal } from '../components/OpportunityModal';

const CATEGORIES = [
  'All',
  'AI & Machine Learning',
  'SaaS',
  'Creator Economy',
  'Health & Wellness',
  'Sustainability',
  'FinTech',
  'EdTech',
  'E-commerce',
  'Gaming',
  'Developer Tools'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'score', label: 'Highest Score' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'shares', label: 'Most Shared' }
];

interface DatabasePageProps {
  onNavigateHome: () => void;
  onUpgradeClick: () => void;
}

export function DatabasePage({ onNavigateHome, onUpgradeClick }: DatabasePageProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minScore, setMinScore] = useState(50);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadOpportunities();
  }, []);

  async function loadOpportunities() {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAndSortedOpportunities = useMemo(() => {
    let filtered = opportunities;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(opp =>
        opp.title.toLowerCase().includes(query) ||
        opp.description.toLowerCase().includes(query) ||
        opp.market_insights.toLowerCase().includes(query) ||
        (opp.category && opp.category.toLowerCase().includes(query)) ||
        (opp.tags && opp.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(opp => opp.category === selectedCategory);
    }

    filtered = filtered.filter(opp => opp.opportunity_score >= minScore);

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.opportunity_score - a.opportunity_score;
        case 'views':
          return (b.view_count || 0) - (a.view_count || 0);
        case 'shares':
          return (b.share_count || 0) - (a.share_count || 0);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [opportunities, searchQuery, selectedCategory, minScore, sortBy]);

  const stats = useMemo(() => {
    const totalOpportunities = opportunities.length;
    const avgScore = opportunities.length > 0
      ? Math.round(opportunities.reduce((sum, opp) => sum + opp.opportunity_score, 0) / opportunities.length)
      : 0;
    const totalViews = opportunities.reduce((sum, opp) => sum + (opp.view_count || 0), 0);
    const totalShares = opportunities.reduce((sum, opp) => sum + (opp.share_count || 0), 0);

    return { totalOpportunities, avgScore, totalViews, totalShares };
  }, [opportunities]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Opportunity Database
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore all discovered startup opportunities
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalOpportunities}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Score</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.avgScore}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Views</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalViews}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <Share2 className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Shares</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalShares}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Score: {minScore}
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={minScore}
                  onChange={(e) => setMinScore(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {filteredAndSortedOpportunities.length === 0 ? (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No opportunities found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setMinScore(50);
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredAndSortedOpportunities.length} of {opportunities.length} opportunities
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAndSortedOpportunities.map(opportunity => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onClick={() => setSelectedOpportunity(opportunity)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {selectedOpportunity && (
        <OpportunityModal
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          onUpgradeClick={onUpgradeClick}
        />
      )}
    </div>
  );
}

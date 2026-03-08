import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Target, Zap, ArrowRight, Heart, Sparkles, TrendingDown, Minus, Flame, Star, Users as UsersIcon } from 'lucide-react';
import { Opportunity, TrendSource } from '../types/opportunity';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getOpportunityStats, calculateMomentumIndicator, getMomentumBadgeStyle } from '../lib/analytics';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onClick: () => void;
  isFavorite?: boolean;
  onFavoriteChange?: () => void;
  isTopOpportunity?: boolean;
}

export function OpportunityCard({ opportunity, onClick, isFavorite: initialIsFavorite, onFavoriteChange, isTopOpportunity }: OpportunityCardProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite || false);
  const [loading, setLoading] = useState(false);
  const [momentum, setMomentum] = useState<ReturnType<typeof calculateMomentumIndicator>>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && initialIsFavorite === undefined) {
      checkFavoriteStatus();
    }
    loadMomentum();
  }, [user, opportunity.id]);

  async function loadMomentum() {
    try {
      const stats = await getOpportunityStats(opportunity.id);
      const momentumIndicator = calculateMomentumIndicator(
        opportunity.created_at,
        stats.view_count,
        stats.share_count,
        opportunity.momentum_score
      );
      setMomentum(momentumIndicator);
    } catch (error) {
      console.error('Error loading momentum:', error);
    }
  }

  async function checkFavoriteStatus() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunity.id)
        .maybeSingle();

      if (error) throw error;
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }

  async function toggleFavorite(e: React.MouseEvent) {
    e.stopPropagation();

    if (!user) {
      alert('Please sign in to save favorites');
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('opportunity_id', opportunity.id);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            opportunity_id: opportunity.id
          }]);

        if (error) throw error;
        setIsFavorite(true);
      }

      if (onFavoriteChange) {
        onFavoriteChange();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite');
    } finally {
      setLoading(false);
    }
  }
  const getDifficultyColor = (score: number) => {
    if (score <= 3) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    if (score <= 6) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
  };

  const getOpportunityColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
  };

  const getOpportunityTextColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTrendSourceLabel = (source?: TrendSource) => {
    switch (source) {
      case 'reddit':
        return 'Reddit';
      case 'google_trends':
        return 'Google Trends';
      case 'product_hunt':
        return 'Product Hunt';
      case 'twitter':
        return 'X (Twitter)';
      case 'ai_generated':
      default:
        return 'AI Generated';
    }
  };

  const getTrendSourceColor = (source?: TrendSource) => {
    switch (source) {
      case 'reddit':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      case 'google_trends':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'product_hunt':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'twitter':
        return 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300';
      case 'ai_generated':
      default:
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
    }
  };

  const getTrendScoreColor = (score: number) => {
    if (score >= 75) return 'from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700';
    if (score >= 50) return 'from-blue-500 to-cyan-600 dark:from-blue-600 dark:to-cyan-700';
    return 'from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700';
  };

  const getTrendScoreBgColor = (score: number) => {
    if (score >= 75) return 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800';
    if (score >= 50) return 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800';
    return 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {opportunity.trend_name}
            </h3>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendSourceColor(opportunity.trend_source)}`}>
              <Sparkles className="w-3 h-3" />
              {getTrendSourceLabel(opportunity.trend_source)}
            </span>
            {isTopOpportunity && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
                <Star className="w-3 h-3 fill-white" />
                Top Opportunity
              </span>
            )}
            {momentum && (
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getMomentumBadgeStyle(momentum.type)} shadow-sm`}>
                {momentum.type === 'trending' && <Flame className="w-3 h-3" />}
                {momentum.type === 'popular' && <UsersIcon className="w-3 h-3" />}
                {momentum.label}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {opportunity.trend_explanation}
          </p>
        </div>
        <button
          onClick={toggleFavorite}
          disabled={loading}
          className="ml-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorite
                ? 'text-red-500 fill-red-500'
                : 'text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-500'
            }`}
          />
        </button>
      </div>

      <div className="space-y-3 mb-5">
        {opportunity.trend_score !== undefined && (
          <div className={`p-4 rounded-lg border ${getTrendScoreBgColor(opportunity.trend_score)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTrendScoreColor(opportunity.trend_score)} flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">{opportunity.trend_score}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Trend Score</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Overall potential</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{opportunity.market_growth_score || 70}</p>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Growth</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Minus className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{100 - (opportunity.competition_level_score || 60)}</p>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Low Competition</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{100 - (opportunity.execution_difficulty_score || 65)}</p>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Feasibility</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <Zap className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Business Idea</p>
            <p className="text-sm text-gray-900 dark:text-white leading-relaxed">{opportunity.business_idea}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Revenue Model</p>
            <p className="text-sm text-gray-900 dark:text-white font-medium">{opportunity.monetization_strategy}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getDifficultyColor(opportunity.difficulty_score)}`}>
            Difficulty {opportunity.difficulty_score}/10
          </div>

          <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${getOpportunityColor(opportunity.opportunity_score)}`}>
            <Target className={`w-4 h-4 ${getOpportunityTextColor(opportunity.opportunity_score)}`} />
            <span className={`text-xs font-semibold ${getOpportunityTextColor(opportunity.opportunity_score)}`}>
              Score: {opportunity.opportunity_score}/100
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 group-hover:gap-2.5 transition-all">
          <span className="text-xs font-medium">View Details</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

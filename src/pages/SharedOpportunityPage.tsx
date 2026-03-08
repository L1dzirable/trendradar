import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TrendingUp, Target, Zap, DollarSign, CheckCircle2, Sparkles, ExternalLink, ArrowRight, Eye } from 'lucide-react';
import { Opportunity, TrendSource } from '../types/opportunity';
import { supabase } from '../lib/supabase';

export function SharedOpportunityPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareId) {
      loadSharedOpportunity();
    }
  }, [shareId]);

  async function loadSharedOpportunity() {
    try {
      const { data: sharedData, error: sharedError } = await supabase
        .from('shared_opportunities')
        .select('opportunity_id, view_count')
        .eq('share_id', shareId)
        .maybeSingle();

      if (sharedError) throw sharedError;
      if (!sharedData) {
        setError('Shared opportunity not found');
        setLoading(false);
        return;
      }

      await supabase
        .from('shared_opportunities')
        .update({ view_count: (sharedData.view_count || 0) + 1 })
        .eq('share_id', shareId);

      const { data: oppData, error: oppError } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', sharedData.opportunity_id)
        .maybeSingle();

      if (oppError) throw oppError;
      if (!oppData) {
        setError('Opportunity not found');
        setLoading(false);
        return;
      }

      setOpportunity(oppData as Opportunity);
    } catch (err) {
      console.error('Error loading shared opportunity:', err);
      setError('Failed to load opportunity');
    } finally {
      setLoading(false);
    }
  }

  const getTrendSourceLabel = (source?: TrendSource) => {
    switch (source) {
      case 'reddit':
        return 'Reddit Trend';
      case 'google_trends':
        return 'Google Trends';
      case 'product_hunt':
        return 'Product Hunt';
      case 'twitter':
        return 'X (Twitter) Trend';
      case 'ai_generated':
      default:
        return 'AI Generated';
    }
  };

  const getTrendSourceColor = (source?: TrendSource) => {
    switch (source) {
      case 'reddit':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'google_trends':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'product_hunt':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'twitter':
        return 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      case 'ai_generated':
      default:
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
  };

  const getDifficultyColor = (score: number) => {
    if (score <= 3) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    if (score <= 6) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  };

  const getDifficultyLabel = (score: number) => {
    if (score <= 3) return 'Easy';
    if (score <= 6) return 'Moderate';
    return 'Challenging';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading opportunity...</p>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Opportunity Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to TrendRadar
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
            <Eye className="w-4 h-4" />
            Shared Business Opportunity
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">TrendRadar</h1>
          <p className="text-gray-600 dark:text-gray-400">AI-Powered Startup Discovery</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 lg:p-8 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {opportunity.trend_name}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              {opportunity.trend_explanation}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className={`px-4 py-2 rounded-lg border text-sm font-semibold flex items-center gap-2 ${getTrendSourceColor(opportunity.trend_source)}`}>
                <Sparkles className="w-4 h-4" />
                <span>Source: {getTrendSourceLabel(opportunity.trend_source)}</span>
                {opportunity.trend_source_url && (
                  <a
                    href={opportunity.trend_source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-70 transition-opacity"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${getDifficultyColor(opportunity.difficulty_score)}`}>
                {getDifficultyLabel(opportunity.difficulty_score)} ({opportunity.difficulty_score}/10)
              </div>
              <div className="px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  Opportunity: {opportunity.opportunity_score}/100
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8 space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Idea</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{opportunity.business_idea}</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Model</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">{opportunity.monetization_strategy}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <Target className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Market Opportunity</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{opportunity.market_opportunity}</p>
            </div>

            {opportunity.execution_plan && opportunity.execution_plan.length > 0 && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Execution Framework</h3>
                </div>
                <div className="space-y-3">
                  {opportunity.execution_plan.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-600 dark:bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed flex-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 lg:p-8 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Build Your Startup?</h3>
              <p className="text-blue-100 mb-6">Generate your own personalized startup plans with TrendRadar</p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg shadow-lg"
              >
                Generate Your Own Startup Plan
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Powered by TrendRadar - AI-Powered Startup Discovery</p>
        </div>
      </div>
    </div>
  );
}

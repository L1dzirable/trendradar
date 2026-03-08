import { X, Target, TrendingUp, Lightbulb, Rocket, CheckCircle2, DollarSign, Tag, Copy, Check, Crown, AlertCircle, Users, Zap, Calendar, Megaphone, Sparkles, ChevronDown, ChevronUp, ExternalLink, Share2, Play } from 'lucide-react';
import { Opportunity, TrendSource } from '../types/opportunity';
import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { generateExecutionPlan } from '../lib/executionPlan';
import { generateLaunchPlan, LaunchPlan } from '../lib/openai';
import { ShareModal } from './ShareModal';
import { trackOpportunityView } from '../lib/analytics';
import { CustomerDiscoverySection } from './CustomerDiscoverySection';
import { CompetitorSnapshot } from './CompetitorSnapshot';
import { LandingPageGenerator } from './LandingPageGenerator';
import { StartupRoadmap } from './StartupRoadmap';
import { supabase } from '../lib/supabase';

interface OpportunityModalProps {
  opportunity: Opportunity;
  onClose: () => void;
  onUpgradeClick?: () => void;
}

export function OpportunityModal({ opportunity, onClose, onUpgradeClick }: OpportunityModalProps) {
  const { userProfile, user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [launchPlan, setLaunchPlan] = useState<LaunchPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const isPro = userProfile?.plan === 'pro';

  useEffect(() => {
    trackOpportunityView(opportunity.id, user?.id);
  }, [opportunity.id, user?.id]);

  const executionDetails = useMemo(() => generateExecutionPlan(opportunity), [opportunity]);

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

  const handleCopyFullIdea = async () => {
    if (!isPro && onUpgradeClick) {
      onUpgradeClick();
      return;
    }

    let content = '';

    if (opportunity.trend_name) {
      content += `Trend: ${opportunity.trend_name}\n\n`;
    }

    if (opportunity.business_idea) {
      content += `Business Idea:\n${opportunity.business_idea}\n\n`;
    }

    if (opportunity.market_opportunity) {
      content += `Target Market:\n${opportunity.market_opportunity}\n\n`;
    }

    if (opportunity.monetization_strategy) {
      content += `Revenue Model:\n${opportunity.monetization_strategy}\n\n`;
    }

    if (opportunity.detailed_explanation) {
      content += `Startup Category:\n${opportunity.detailed_explanation}\n\n`;
    }

    if (opportunity.execution_plan && opportunity.execution_plan.length > 0) {
      content += `Execution Plan:\n`;
      opportunity.execution_plan.forEach((step, index) => {
        content += `${index + 1}. ${step}\n`;
      });
      content += '\n';
    }

    if (opportunity.first_steps && opportunity.first_steps.length > 0) {
      content += `First Steps:\n`;
      opportunity.first_steps.forEach((step, index) => {
        content += `${index + 1}. ${step}\n`;
      });
    }

    try {
      await navigator.clipboard.writeText(content.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleGenerateLaunchPlan = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const plan = await generateLaunchPlan(
        opportunity.id,
        opportunity.trend_name,
        opportunity.business_idea
      );
      setLaunchPlan(plan);
      setIsExpanded(true);
    } catch (err: any) {
      console.error('Failed to generate launch plan:', err);
      if (err.message.includes('Daily limit reached') || err.message.includes('limitReached')) {
        setError('Daily limit reached. Free users can generate 1 launch plan per day. Upgrade to Pro for unlimited access.');
        if (onUpgradeClick) {
          setTimeout(() => onUpgradeClick(), 2000);
        }
      } else {
        setError(err.message || 'Failed to generate launch plan. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 lg:p-8 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between">
          <div className="flex-1 pr-4">
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
                    onClick={(e) => e.stopPropagation()}
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
              <button
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2 text-sm font-semibold"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button
                onClick={handleCopyFullIdea}
                className={`px-4 py-2 rounded-lg ${
                  isPro
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                } transition-colors flex items-center gap-2 text-sm font-semibold`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    {!isPro && <Crown className="w-4 h-4" />}
                    <Copy className="w-4 h-4" />
                    <span>{isPro ? 'Copy Full Idea' : 'Upgrade to Copy'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 lg:p-8 space-y-8">
          {opportunity.trend_score !== undefined && (
            <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-800 rounded-xl p-6 border border-blue-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Trend Score Breakdown</h3>

              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center mb-3 shadow-lg">
                      <span className="text-white font-bold text-2xl">{opportunity.trend_score}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white text-center">Overall Score</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">Trend Potential</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-3">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{opportunity.market_growth_score || 70}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Market Growth</p>
                    </div>
                  </div>
                  <div className="mt-3 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all"
                      style={{ width: `${opportunity.market_growth_score || 70}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-3">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{100 - (opportunity.competition_level_score || 60)}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Low Competition</p>
                    </div>
                  </div>
                  <div className="mt-3 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 transition-all"
                      style={{ width: `${100 - (opportunity.competition_level_score || 60)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-3">
                      <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{100 - (opportunity.execution_difficulty_score || 65)}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Feasibility</p>
                    </div>
                  </div>
                  <div className="mt-3 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all"
                      style={{ width: `${100 - (opportunity.execution_difficulty_score || 65)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-center">
                  The Trend Score combines market growth potential, competitive landscape, and execution feasibility to help you identify the most promising opportunities.
                </p>
              </div>
            </section>
          )}

          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Business Idea
              </h3>
            </div>
            <p className="text-gray-900 dark:text-white text-lg font-medium mb-4 leading-relaxed">
              {opportunity.business_idea}
            </p>
            <div className="flex items-start gap-3 pt-4 border-t border-blue-200 dark:border-blue-800">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Revenue Model</p>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {opportunity.monetization_strategy}
                </p>
              </div>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-6">
            <section className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Target Market
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {opportunity.market_opportunity || 'Market analysis based on current trends and demand patterns. This opportunity targets businesses and consumers seeking innovative solutions.'}
              </p>
            </section>

            <section className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Tag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Startup Category
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {opportunity.detailed_explanation || 'This is a high-potential opportunity in an emerging market segment with strong growth indicators.'}
              </p>
            </section>
          </div>

          <section className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <Rocket className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Execution Plan
              </h3>
            </div>
            <div className="space-y-3">
              {opportunity.execution_plan && opportunity.execution_plan.length > 0 ? (
                opportunity.execution_plan.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-violet-200 dark:border-violet-800"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed pt-0.5">
                      {step}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400 italic">No execution plan available yet.</p>
              )}
            </div>
          </section>

          <section className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                First Steps to Launch
              </h3>
            </div>
            <div className="space-y-3">
              {opportunity.first_steps && opportunity.first_steps.length > 0 ? (
                opportunity.first_steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      {step}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400 italic">No first steps available yet.</p>
              )}
            </div>
          </section>

          <section className="border-t-4 border-blue-500 dark:border-blue-600 bg-white dark:bg-gray-800 rounded-xl p-6 lg:p-8 shadow-lg">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Execution Framework
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                A structured approach to turn this opportunity into a real business
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-5 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Problem</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {executionDetails.problem}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Target Customer</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {executionDetails.target_customer}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-5 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Solution</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {executionDetails.solution}
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-5 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Revenue Model</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {executionDetails.revenue_model}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">MVP in 7 Days</h4>
                </div>
                <div className="space-y-3">
                  {executionDetails.mvp_7_days.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm pt-0.5">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg p-6 border border-teal-200 dark:border-teal-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                    <Megaphone className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">First Customer Acquisition Channels</h4>
                </div>
                <div className="space-y-2">
                  {executionDetails.customer_acquisition.map((channel, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
                        {channel}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="border-t-4 border-gradient-to-r from-pink-500 to-rose-500 bg-white dark:bg-gray-800 rounded-xl p-6 lg:p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Launch Plan Generator
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Generate a structured 30-day launch plan with product positioning, MVP features, and monetization strategy
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateLaunchPlan}
              disabled={isGenerating}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
                'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl'
              } ${isGenerating ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Launch Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Launch Plan</span>
                  {!isPro && <span className="text-xs bg-white/20 px-2 py-1 rounded-full">1/day free</span>}
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {launchPlan && (
              <div className="mt-6 space-y-4">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg border border-pink-200 dark:border-pink-800 hover:border-pink-300 dark:hover:border-pink-700 transition-colors"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">
                    View Launch Plan Details
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="space-y-6 animate-in slide-in-from-top duration-300">
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg p-6 border border-pink-200 dark:border-pink-800">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                        Product Name
                      </h4>
                      <p className="text-gray-800 dark:text-gray-200 text-lg font-semibold">
                        {launchPlan.productName}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Value Proposition
                      </h4>
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                        {launchPlan.valueProposition}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        Landing Page Headline
                      </h4>
                      <p className="text-gray-800 dark:text-gray-200 text-xl font-semibold italic">
                        "{launchPlan.landingPageHeadline}"
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-green-600 dark:text-green-400" />
                        MVP Features
                      </h4>
                      <ul className="space-y-2">
                        {launchPlan.mvpFeatures.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-800 dark:text-gray-200">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        Monetization Strategy
                      </h4>
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                        {launchPlan.monetizationStrategy}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        30-Day Launch Plan
                      </h4>
                      <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                        {launchPlan.launchPlan30Days}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
          <StartupRoadmap roadmap={opportunity.startup_roadmap as any} />

          <CustomerDiscoverySection data={opportunity.customer_discovery as any} />

          <CompetitorSnapshot competitors={opportunity.competitors as any} />

          <LandingPageGenerator landingPageCopy={opportunity.landing_page_copy as any} />

          {user && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Start Building This Startup
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Convert this opportunity into a tracked project with milestones
                  </p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const { data, error } = await supabase
                        .from('projects')
                        .insert({
                          user_id: user.id,
                          opportunity_id: opportunity.id,
                          title: opportunity.trend_name,
                          current_stage: 'idea_discovered',
                          notes: `Based on: ${opportunity.trend_explanation}`
                        })
                        .select()
                        .single();

                      if (error) throw error;

                      const stages = ['idea_discovered', 'market_validation', 'customer_discovery', 'mvp_development', 'launch', 'first_revenue'];
                      await supabase.from('project_milestones').insert(
                        stages.map((stage, index) => ({
                          project_id: data.id,
                          stage,
                          completed: index === 0,
                          completed_at: index === 0 ? new Date().toISOString() : null
                        }))
                      );

                      alert('Project created successfully!');
                      onClose();
                    } catch (error) {
                      console.error('Error creating project:', error);
                      alert('Failed to create project');
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg font-semibold"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Project</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          opportunityId={opportunity.id}
          opportunityTitle={opportunity.trend_name}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}

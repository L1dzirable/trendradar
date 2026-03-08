import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Target, Rocket, DollarSign } from 'lucide-react';
import { Opportunity } from '../types/opportunity';
import { OpportunityCard } from '../components/OpportunityCard';
import { supabase } from '../lib/supabase';

interface TrendReportPageProps {
  onNavigateHome: () => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
}

const trendReports = {
  'ai-startup-opportunities': {
    title: 'AI Startup Opportunities 2026',
    description: 'Discover the most promising AI-powered business opportunities emerging in 2026. From automation to personalization, these trends are reshaping industries.',
    keywords: ['ai startups', 'artificial intelligence', 'machine learning', 'ai business ideas'],
    filterKeywords: ['ai', 'automation', 'machine learning', 'gpt', 'chatbot', 'intelligence']
  },
  'micro-saas-opportunities': {
    title: 'Micro-SaaS Opportunities for Solo Founders',
    description: 'Small, focused SaaS products perfect for solo entrepreneurs. These niche opportunities require minimal investment but offer high profit potential.',
    keywords: ['micro saas', 'solo founder', 'indie hacker', 'bootstrapped startup'],
    filterKeywords: ['saas', 'subscription', 'b2b', 'automation', 'tool', 'platform']
  },
  'creator-economy-startups': {
    title: 'Creator Economy Startup Ideas',
    description: 'Build tools and services for content creators, influencers, and digital entrepreneurs. The creator economy continues to boom with new monetization opportunities.',
    keywords: ['creator economy', 'influencer tools', 'content creator', 'monetization'],
    filterKeywords: ['creator', 'content', 'influencer', 'monetization', 'audience', 'community']
  }
};

export function TrendReportPage({ onNavigateHome, onSelectOpportunity }: TrendReportPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  const report = slug ? trendReports[slug as keyof typeof trendReports] : null;

  useEffect(() => {
    if (report) {
      loadOpportunities();
    }
  }, [slug]);

  async function loadOpportunities() {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('trend_score', { ascending: false, nullsFirst: false })
        .limit(10);

      if (error) throw error;

      const filtered = data?.filter(opp => {
        const text = `${opp.trend_name} ${opp.business_idea} ${opp.trend_explanation}`.toLowerCase();
        return report?.filterKeywords.some(keyword => text.includes(keyword));
      }) || [];

      setOpportunities(filtered);
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!report) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                {report.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                {report.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {report.keywords.map((keyword) => (
              <span
                key={keyword}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
              >
                #{keyword.replace(/ /g, '-')}
              </span>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <Target className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Market-Validated Ideas
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Every opportunity is based on real trend signals from Reddit, Product Hunt, and industry analysis.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <Rocket className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Execution Frameworks
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get step-by-step launch plans with detailed execution strategies for each opportunity.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <DollarSign className="w-10 h-10 text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Clear Monetization
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Each idea includes proven revenue models and realistic pricing strategies.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No opportunities found in this category yet.
            </p>
            <button
              onClick={onNavigateHome}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Discover New Opportunities
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Top Opportunities ({opportunities.length})
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Ranked by trend score, market potential, and execution feasibility
              </p>
            </div>

            <div className="grid gap-6 mb-12">
              {opportunities.map((opportunity, index) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onClick={() => onSelectOpportunity(opportunity)}
                  isTopOpportunity={index === 0}
                />
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4">
                Ready to turn an idea into reality?
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Generate detailed launch plans and execution strategies for any opportunity
              </p>
              <button
                onClick={onNavigateHome}
                className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-colors font-bold text-lg shadow-lg"
              >
                Start Your Startup Journey
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export type TrendSource = 'reddit' | 'google_trends' | 'product_hunt' | 'twitter' | 'ai_generated';

export interface Opportunity {
  id: string;
  trend_name: string;
  trend_explanation: string;
  business_idea: string;
  monetization_strategy: string;
  difficulty_score: number;
  opportunity_score: number;
  detailed_explanation: string;
  market_opportunity: string;
  execution_plan: string[];
  first_steps: string[];
  created_at: string;
  trend_source?: TrendSource;
  trend_source_url?: string;
  problem?: string;
  target_customer?: string;
  solution?: string;
  revenue_model?: string;
  mvp_7_days?: string[];
  customer_acquisition?: string[];
  trend_score?: number;
  market_growth_score?: number;
  competition_level_score?: number;
  execution_difficulty_score?: number;
  momentum_score?: number;
  is_trending?: boolean;
  scan_batch_id?: string;
}

export interface OpportunityStats {
  view_count: number;
  share_count: number;
  favorite_count: number;
  last_viewed_at: string | null;
}

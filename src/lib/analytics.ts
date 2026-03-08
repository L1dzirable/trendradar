import { supabase } from './supabase';

export interface MomentumIndicator {
  label: string;
  type: 'trending' | 'early' | 'popular' | 'new';
  score: number;
}

export function getSessionId(): string {
  let sessionId = sessionStorage.getItem('trendradar_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('trendradar_session', sessionId);
  }
  return sessionId;
}

export async function trackOpportunityView(opportunityId: string, userId?: string) {
  try {
    const sessionId = getSessionId();

    const { error } = await supabase
      .from('opportunity_views')
      .insert([{
        opportunity_id: opportunityId,
        user_id: userId || null,
        session_id: sessionId,
        viewed_at: new Date().toISOString()
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking view:', error);
  }
}

export async function trackOpportunityShare(
  opportunityId: string,
  platform: string,
  userId?: string
) {
  try {
    const { error } = await supabase
      .from('opportunity_shares')
      .insert([{
        opportunity_id: opportunityId,
        user_id: userId || null,
        platform,
        shared_at: new Date().toISOString()
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking share:', error);
  }
}

export async function getOpportunityStats(opportunityId: string) {
  try {
    const { data, error } = await supabase
      .from('opportunity_stats')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .maybeSingle();

    if (error) throw error;

    return data || {
      view_count: 0,
      share_count: 0,
      favorite_count: 0,
      last_viewed_at: null
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return {
      view_count: 0,
      share_count: 0,
      favorite_count: 0,
      last_viewed_at: null
    };
  }
}

export function calculateMomentumIndicator(
  createdAt: string,
  viewCount: number,
  shareCount: number,
  momentumScore?: number
): MomentumIndicator | null {
  const now = new Date();
  const created = new Date(createdAt);
  const hoursSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  const daysSinceCreation = hoursSinceCreation / 24;

  if (hoursSinceCreation < 24 && (viewCount > 50 || shareCount > 5)) {
    return {
      label: 'Trending today',
      type: 'trending',
      score: 100
    };
  }

  if (daysSinceCreation < 3) {
    return {
      label: 'Early opportunity',
      type: 'early',
      score: 85
    };
  }

  if (viewCount > 100 || shareCount > 10) {
    const foundersCount = Math.floor(viewCount / 20);
    return {
      label: `${foundersCount} founders exploring this`,
      type: 'popular',
      score: 75
    };
  }

  if (daysSinceCreation < 7) {
    return {
      label: 'New opportunity',
      type: 'new',
      score: 60
    };
  }

  return null;
}

export function getMomentumBadgeStyle(type: MomentumIndicator['type']) {
  switch (type) {
    case 'trending':
      return 'bg-gradient-to-r from-orange-500 to-red-500 text-white';
    case 'early':
      return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
    case 'popular':
      return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white';
    case 'new':
      return 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white';
    default:
      return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  }
}

export async function updateMomentumScores() {
  try {
    const { data: opportunities, error } = await supabase
      .from('opportunities')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    for (const opportunity of opportunities || []) {
      const stats = await getOpportunityStats(opportunity.id);
      const momentum = calculateMomentumIndicator(
        opportunity.created_at,
        stats.view_count,
        stats.share_count
      );

      if (momentum) {
        await supabase
          .from('opportunities')
          .update({
            momentum_score: momentum.score,
            is_trending: momentum.type === 'trending'
          })
          .eq('id', opportunity.id);
      }
    }
  } catch (error) {
    console.error('Error updating momentum scores:', error);
  }
}

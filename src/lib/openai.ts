export async function generateOpportunityWithAI() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing');
  }

  const apiUrl = `${supabaseUrl}/functions/v1/generate-opportunity`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate opportunity');
  }

  const opportunity = await response.json();
  return opportunity;
}

export interface LaunchPlan {
  productName: string;
  valueProposition: string;
  landingPageHeadline: string;
  mvpFeatures: string[];
  monetizationStrategy: string;
  launchPlan30Days: string;
}

export async function generateLaunchPlan(opportunityId: string, trendName: string, businessIdea: string): Promise<LaunchPlan> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing');
  }

  const apiUrl = `${supabaseUrl}/functions/v1/generate-launch-plan`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      opportunityId,
      trendName,
      businessIdea,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate launch plan');
  }

  const launchPlan = await response.json();
  return launchPlan;
}

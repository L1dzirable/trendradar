import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface LaunchPlanRequest {
  opportunityId: string;
  trendName: string;
  businessIdea: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('plan, launch_plans_generated_today, last_launch_plan_date')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const isPro = profile?.plan === 'pro' || profile?.plan === 'premium';

    let launchPlansToday = profile?.launch_plans_generated_today || 0;
    const lastDate = profile?.last_launch_plan_date;

    if (lastDate !== today) {
      launchPlansToday = 0;
    }

    if (!isPro && launchPlansToday >= 1) {
      return new Response(
        JSON.stringify({
          error: 'Daily limit reached',
          message: 'Free users can generate 1 launch plan per day. Upgrade to Pro for unlimited access.',
          limitReached: true
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { opportunityId, trendName, businessIdea }: LaunchPlanRequest = await req.json();

    const prompt = `You are a startup advisor. Generate a comprehensive launch plan for the following business opportunity:

Trend: ${trendName}
Business Idea: ${businessIdea}

Provide a structured response in JSON format with the following fields:
{
  "productName": "A catchy product name",
  "valueProposition": "A clear one-sentence value proposition",
  "landingPageHeadline": "A compelling headline for the landing page",
  "mvpFeatures": ["feature1", "feature2", "feature3", "feature4", "feature5"],
  "monetizationStrategy": "Detailed monetization strategy (2-3 sentences)",
  "launchPlan30Days": "A detailed 30-day launch plan with weekly milestones (3-4 paragraphs)"
}

Be specific, actionable, and realistic.`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful startup advisor who provides structured, actionable advice. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to generate launch plan from AI' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const aiData = await openaiResponse.json();
    const content = aiData.choices[0].message.content;

    let launchPlan;
    try {
      launchPlan = JSON.parse(content);
    } catch (parseError) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        launchPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    const { error: insertError } = await supabase
      .from('launch_plan_usage')
      .insert({
        user_id: user.id,
        opportunity_id: opportunityId,
        plan_data: launchPlan,
      });

    if (insertError) {
      console.error('Failed to save launch plan:', insertError);
    }

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        launch_plans_generated_today: launchPlansToday + 1,
        last_launch_plan_date: today,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update usage:', updateError);
    }

    return new Response(
      JSON.stringify(launchPlan),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error generating launch plan:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

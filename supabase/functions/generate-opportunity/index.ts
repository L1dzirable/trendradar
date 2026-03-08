import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from "npm:openai@4.77.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    let trendSignal = null;
    let trendSource = 'ai_generated';
    let trendSourceUrl = null;

    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

      if (supabaseUrl && supabaseKey) {
        const trendResponse = await fetch(
          `${supabaseUrl}/functions/v1/fetch-trend-signals`,
          {
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
            },
          }
        );

        if (trendResponse.ok) {
          const trendData = await trendResponse.json();
          if (trendData.trend) {
            trendSignal = trendData.trend;
            trendSource = trendData.trend.source;
            trendSourceUrl = trendData.trend.url;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to fetch trend signals, using AI generation:', error);
    }

    const trendContext = trendSignal
      ? `Base your idea on this real trend signal from ${trendSignal.source}:
Title: ${trendSignal.title}
${trendSignal.description ? `Description: ${trendSignal.description}` : ''}

Use this as inspiration to create a related business opportunity.`
      : 'Generate a unique idea based on current global trends.';

    const prompt = `Generate a unique and profitable SaaS business opportunity.

${trendContext}

Return a JSON object with the following structure (no markdown, just pure JSON):
{
  "trend_name": "Short catchy name of the trend (e.g., 'AI Automation for Restaurants')",
  "trend_explanation": "2-3 sentences explaining the trend and why it matters",
  "business_idea": "Clear description of the SaaS product/service idea",
  "monetization_strategy": "Specific pricing model (e.g., '€200/month per user')",
  "difficulty_score": number between 1-10 (1=easiest, 10=hardest),
  "opportunity_score": number between 0-100 (higher = better opportunity),
  "detailed_explanation": "Detailed 3-4 sentence explanation of why this is a good opportunity",
  "market_opportunity": "2-3 sentences about market size, growth potential, and target customers",
  "execution_plan": ["step 1", "step 2", "step 3", "step 4", "step 5", "step 6", "step 7"],
  "first_steps": ["action 1", "action 2", "action 3", "action 4", "action 5"],
  "market_growth_score": number between 0-100 (market growth potential, higher = faster growth),
  "competition_level_score": number between 0-100 (0 = no competition, 100 = saturated market),
  "execution_difficulty_score": number between 0-100 (0 = very easy, 100 = very difficult)
}

Focus on:
- Real, emerging trends in 2025-2026
- B2B SaaS or B2C subscription models
- Problems that businesses or consumers actually face
- Practical, achievable ideas for solo founders or small teams
- Clear monetization paths
- Realistic difficulty and opportunity scores

Score Guidelines:
- market_growth_score: Consider market size, growth rate, adoption trends
- competition_level_score: Consider existing solutions, barriers to entry, market saturation
- execution_difficulty_score: Consider technical complexity, time to market, resource requirements

Make it specific, actionable, and unique. Avoid generic ideas.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a startup advisor and trend analyst who identifies profitable SaaS business opportunities. You provide detailed, actionable business ideas with realistic assessments.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.9,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const opportunity = JSON.parse(content);

    const marketGrowth = Math.min(100, Math.max(0, opportunity.market_growth_score || 70));
    const competition = Math.min(100, Math.max(0, opportunity.competition_level_score || 60));
    const executionDifficulty = Math.min(100, Math.max(0, opportunity.execution_difficulty_score || 65));

    const trendScore = Math.round(
      (marketGrowth * 0.4) +
      ((100 - competition) * 0.3) +
      ((100 - executionDifficulty) * 0.3)
    );

    const result = {
      trend_name: opportunity.trend_name,
      trend_explanation: opportunity.trend_explanation,
      business_idea: opportunity.business_idea,
      monetization_strategy: opportunity.monetization_strategy,
      difficulty_score: Math.min(10, Math.max(1, opportunity.difficulty_score)),
      opportunity_score: Math.min(100, Math.max(0, opportunity.opportunity_score)),
      detailed_explanation: opportunity.detailed_explanation,
      market_opportunity: opportunity.market_opportunity,
      execution_plan: opportunity.execution_plan,
      first_steps: opportunity.first_steps,
      trend_source: trendSource,
      trend_source_url: trendSourceUrl,
      trend_score: trendScore,
      market_growth_score: marketGrowth,
      competition_level_score: competition,
      execution_difficulty_score: executionDifficulty,
    };

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating opportunity:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate opportunity",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

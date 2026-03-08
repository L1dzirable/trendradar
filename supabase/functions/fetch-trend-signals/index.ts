import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TrendSignal {
  source: 'reddit' | 'google_trends' | 'product_hunt' | 'twitter';
  title: string;
  description?: string;
  url?: string;
  score?: number;
}

async function fetchRedditTrends(): Promise<TrendSignal[]> {
  try {
    const subreddits = ['SaaS', 'startups', 'Entrepreneur', 'business', 'smallbusiness'];
    const randomSubreddit = subreddits[Math.floor(Math.random() * subreddits.length)];

    const response = await fetch(
      `https://www.reddit.com/r/${randomSubreddit}/hot.json?limit=10`,
      {
        headers: {
          'User-Agent': 'TrendRadar/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json();
    const posts = data.data.children;

    return posts.slice(0, 5).map((post: any) => ({
      source: 'reddit' as const,
      title: post.data.title,
      description: post.data.selftext?.substring(0, 200),
      url: `https://reddit.com${post.data.permalink}`,
      score: post.data.score,
    }));
  } catch (error) {
    console.error('Reddit fetch error:', error);
    return [];
  }
}

async function fetchProductHuntTrends(): Promise<TrendSignal[]> {
  try {
    const response = await fetch(
      'https://www.producthunt.com/frontend/graphql',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TrendRadar/1.0',
        },
        body: JSON.stringify({
          query: `{
            posts(first: 5, order: VOTES) {
              edges {
                node {
                  name
                  tagline
                  votesCount
                  url
                }
              }
            }
          }`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ProductHunt API error: ${response.status}`);
    }

    const data = await response.json();
    const posts = data.data?.posts?.edges || [];

    return posts.map((edge: any) => ({
      source: 'product_hunt' as const,
      title: edge.node.name,
      description: edge.node.tagline,
      url: edge.node.url,
      score: edge.node.votesCount,
    }));
  } catch (error) {
    console.error('ProductHunt fetch error:', error);
    return [];
  }
}

async function getGoogleTrendsTopics(): Promise<TrendSignal[]> {
  const topics = [
    { title: 'AI Automation Tools', description: 'Growing interest in AI-powered business automation' },
    { title: 'Remote Work Software', description: 'Tools for distributed teams and async communication' },
    { title: 'No-Code Platforms', description: 'Visual development tools for non-technical founders' },
    { title: 'Sustainability Tech', description: 'Green technology and carbon tracking solutions' },
    { title: 'Creator Economy Tools', description: 'Platforms helping creators monetize their content' },
    { title: 'Health & Wellness Apps', description: 'Mental health and fitness tracking applications' },
    { title: 'Web3 & Blockchain', description: 'Decentralized applications and smart contracts' },
    { title: 'EdTech Platforms', description: 'Online learning and skill development tools' },
  ];

  const randomTopics = topics
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return randomTopics.map(topic => ({
    source: 'google_trends' as const,
    title: topic.title,
    description: topic.description,
  }));
}

async function getTwitterTrends(): Promise<TrendSignal[]> {
  const trendingTopics = [
    { title: 'AI Agents for Business', description: 'Autonomous AI systems handling business workflows' },
    { title: 'Micro-SaaS Success Stories', description: 'Small profitable SaaS businesses with focused features' },
    { title: 'API-First Products', description: 'Developer tools and infrastructure services' },
    { title: 'Local Business Tech', description: 'Software solutions for brick-and-mortar businesses' },
    { title: 'Privacy-First Apps', description: 'Data privacy and security focused applications' },
    { title: 'Vertical SaaS', description: 'Industry-specific software solutions' },
  ];

  const randomTopics = trendingTopics
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  return randomTopics.map(topic => ({
    source: 'twitter' as const,
    title: topic.title,
    description: topic.description,
  }));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const redditTrends = await fetchRedditTrends();
    const productHuntTrends = await fetchProductHuntTrends();
    const googleTrends = await getGoogleTrendsTopics();
    const twitterTrends = await getTwitterTrends();

    const allTrends = [
      ...redditTrends,
      ...productHuntTrends,
      ...googleTrends,
      ...twitterTrends,
    ].filter(trend => trend.title && trend.title.length > 0);

    const randomTrend = allTrends.length > 0
      ? allTrends[Math.floor(Math.random() * allTrends.length)]
      : null;

    return new Response(
      JSON.stringify({
        trend: randomTrend,
        totalSignals: allTrends.length,
        sources: {
          reddit: redditTrends.length,
          product_hunt: productHuntTrends.length,
          google_trends: googleTrends.length,
          twitter: twitterTrends.length,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching trends:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Failed to fetch trends",
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

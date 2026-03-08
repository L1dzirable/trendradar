export const mockOpportunities = [
  {
    trend_name: 'AI Automation for Restaurants',
    trend_explanation: 'Restaurants are increasingly overwhelmed by managing online reservations, responding to reviews, and handling customer communications across multiple platforms.',
    business_idea: 'AI-powered platform that automates restaurant reservation management, review responses, and customer communication',
    monetization_strategy: '€200/month SaaS subscription per restaurant location',
    difficulty_score: 5,
    opportunity_score: 82,
    detailed_explanation: 'The restaurant industry is experiencing a digital transformation, with customers expecting seamless online interactions. However, most restaurants lack the resources to manage multiple platforms efficiently. This creates a significant opportunity for an AI solution that can handle reservations, respond to reviews authentically, and manage customer inquiries 24/7.',
    market_opportunity: 'The global restaurant management software market is valued at $6.8B and growing at 14% annually. With over 1M restaurants in Europe alone, even capturing 0.1% would generate €2M ARR. Restaurants spend an average of 15 hours/week on these tasks, making the ROI clear.',
    execution_plan: [
      'Build MVP with OpenAI API integration for review responses',
      'Integrate with major reservation platforms (OpenTable, TheFork, Resy)',
      'Develop sentiment analysis for review prioritization',
      'Create dashboard for restaurant managers to monitor AI actions',
      'Pilot with 10 local restaurants for feedback',
      'Build marketing funnel targeting restaurant associations',
      'Scale to 100 customers within 12 months'
    ],
    first_steps: [
      'Interview 20 restaurant owners to validate pain points',
      'Research existing review management and reservation APIs',
      'Prototype AI review response generator with GPT-4',
      'Create landing page and collect email signups',
      'Offer free trial to first 5 restaurants'
    ],
    trend_score: 78,
    market_growth_score: 85,
    competition_level_score: 55,
    execution_difficulty_score: 50
  },
  {
    trend_name: 'Remote Work Productivity Tools',
    trend_explanation: 'Companies struggle to maintain productivity and team cohesion with distributed teams spread across time zones.',
    business_idea: 'Async-first collaboration platform with built-in focus time management and team rituals',
    monetization_strategy: '€15/user/month with team plans at €120/month for 10 users',
    difficulty_score: 7,
    opportunity_score: 75,
    detailed_explanation: 'As remote work becomes permanent, companies need better tools than just video calls and chat. The key is building async-first workflows that respect deep work time while maintaining team connection. This platform would combine project management, asynchronous communication, and team building in one place.',
    market_opportunity: 'The collaboration software market is $31B and growing rapidly. With 35% of workers now remote full-time, companies are actively seeking better solutions. The average company uses 6-8 different tools, creating opportunity for consolidation.',
    execution_plan: [
      'Design async-first communication patterns and workflows',
      'Build core project management features',
      'Implement focus time blocking and notification management',
      'Add team ritual features (daily standups, retrospectives)',
      'Create integration with Slack, Calendar, and email',
      'Launch beta with 50 remote-first companies',
      'Develop content marketing strategy around remote work best practices'
    ],
    first_steps: [
      'Survey 50 remote team managers about current pain points',
      'Map out core workflows and user journey',
      'Build clickable prototype in Figma',
      'Create waiting list with educational content',
      'Partner with remote work influencers for validation'
    ],
    trend_score: 65,
    market_growth_score: 75,
    competition_level_score: 70,
    execution_difficulty_score: 70
  },
  {
    trend_name: 'Sustainable Fashion Resale',
    trend_explanation: 'Consumers increasingly want sustainable fashion options but find current resale platforms fragmented and time-consuming.',
    business_idea: 'AI-powered wardrobe management app that automatically lists items for resale and suggests sustainable purchases',
    monetization_strategy: '20% commission on sales + €5/month premium for advanced features',
    difficulty_score: 6,
    opportunity_score: 78,
    detailed_explanation: 'The secondhand fashion market is booming but remains inefficient. People have clothes they want to sell but lack time to photograph, list, and manage sales across multiple platforms. An AI solution that handles the entire process—from photography optimization to pricing to listing—could capture significant market share.',
    market_opportunity: 'The global secondhand apparel market will reach $77B by 2025, growing 3x faster than traditional retail. Gen Z and Millennials drive 70% of resale purchases. The average person has €500-1000 worth of unworn clothes.',
    execution_plan: [
      'Develop AI image recognition for clothing categorization',
      'Build pricing algorithm based on market data',
      'Integrate with major resale platforms (Vinted, Depop, eBay)',
      'Create mobile app for easy photo capture and listing',
      'Implement shipping label generation and logistics',
      'Partner with sustainable fashion influencers',
      'Launch referral program to drive viral growth'
    ],
    first_steps: [
      'Test manual version with 20 users to validate demand',
      'Research APIs for major resale platforms',
      'Build simple prototype with photo upload and AI categorization',
      'Create Instagram content showing before/after listings',
      'Recruit fashion-conscious beta testers'
    ],
    trend_score: 72,
    market_growth_score: 88,
    competition_level_score: 60,
    execution_difficulty_score: 58
  },
  {
    trend_name: 'Personalized Health Coaching',
    trend_explanation: 'People want personalized health guidance but personal coaches are expensive and not data-driven enough.',
    business_idea: 'AI health coach that integrates wearable data to provide personalized nutrition, exercise, and sleep recommendations',
    monetization_strategy: '€30/month subscription with optional 1-on-1 coach sessions at €50/session',
    difficulty_score: 8,
    opportunity_score: 71,
    detailed_explanation: 'Wearables generate vast amounts of health data, but most people don\'t know how to act on it. An AI coach that analyzes sleep, activity, heart rate, and nutrition data to provide actionable daily recommendations could bridge this gap. The key is making insights simple and actionable.',
    market_opportunity: 'The digital health market is $175B and growing at 15% annually. Over 400M wearable devices are in use globally. Users are willing to pay for services that help them achieve health goals, as proven by apps like Noom ($400M revenue).',
    execution_plan: [
      'Integrate with major wearables (Apple Health, Google Fit, Oura)',
      'Develop AI models for personalized recommendations',
      'Build nutrition tracking and meal planning features',
      'Create daily coaching interface with habit tracking',
      'Implement progress tracking and goal setting',
      'Recruit certified nutritionists and coaches for validation',
      'Launch content marketing focused on specific health goals'
    ],
    first_steps: [
      'Analyze data from 100 wearable users to identify patterns',
      'Interview health coaches about their methodology',
      'Build MVP with Apple Health integration',
      'Create 30-day coaching program for initial users',
      'Partner with biohacking and health communities'
    ],
    trend_score: 68,
    market_growth_score: 82,
    competition_level_score: 65,
    execution_difficulty_score: 75
  }
];

export function generateNewOpportunity(): typeof mockOpportunities[0] {
  const trends = [
    {
      trend_name: 'AI-Powered Content Repurposing',
      trend_explanation: 'Content creators spend hours adapting content for different platforms but lack time and resources.',
      business_idea: 'Automated platform that converts long-form content into platform-specific posts (Twitter threads, LinkedIn articles, TikTok scripts)',
      monetization_strategy: '€49/month for 100 conversions, €149/month unlimited',
      difficulty_score: 4,
      opportunity_score: 79
    },
    {
      trend_name: 'Local Service Marketplace',
      trend_explanation: 'People struggle to find reliable local services like plumbers, electricians, and cleaners.',
      business_idea: 'Hyperlocal service marketplace with instant booking and transparent pricing',
      monetization_strategy: '15% commission on bookings + featured listings at €99/month',
      difficulty_score: 6,
      opportunity_score: 73
    },
    {
      trend_name: 'Pet Care Automation',
      trend_explanation: 'Pet owners want better ways to track their pet\'s health, schedule vet visits, and manage care.',
      business_idea: 'All-in-one pet care app with health tracking, vet booking, and automated reminders',
      monetization_strategy: '€12/month per pet + telemedicine consultations at €35/session',
      difficulty_score: 5,
      opportunity_score: 76
    },
    {
      trend_name: 'Micro-Learning Platforms',
      trend_explanation: 'Professionals want to learn new skills but lack time for traditional courses.',
      business_idea: '5-minute daily lessons delivered via mobile app on in-demand skills',
      monetization_strategy: '€20/month subscription or €200/year',
      difficulty_score: 6,
      opportunity_score: 80
    },
    {
      trend_name: 'Carbon Footprint Tracking',
      trend_explanation: 'Consumers want to reduce their environmental impact but don\'t know where to start.',
      business_idea: 'App that tracks carbon footprint from purchases and suggests sustainable alternatives',
      monetization_strategy: '€8/month premium + affiliate revenue from sustainable brands',
      difficulty_score: 7,
      opportunity_score: 68
    },
    {
      trend_name: 'Virtual Event Networking',
      trend_explanation: 'Virtual events lack the organic networking that happens at in-person conferences.',
      business_idea: 'AI-powered networking platform that matches attendees and facilitates meaningful connections',
      monetization_strategy: '€2/attendee or €500/event flat fee',
      difficulty_score: 6,
      opportunity_score: 74
    }
  ];

  const randomTrend = trends[Math.floor(Math.random() * trends.length)];

  return {
    ...randomTrend,
    detailed_explanation: `This opportunity addresses a growing market need with a clear value proposition. ${randomTrend.trend_explanation} By solving this problem, you can capture significant market share in an underserved niche.`,
    market_opportunity: 'This market is experiencing rapid growth with strong demand signals. Early movers have the advantage of building brand recognition and capturing market share before competition intensifies. The target customer has clear pain points and willingness to pay for solutions.',
    execution_plan: [
      'Conduct customer interviews to validate the problem',
      'Build minimal viable product with core features',
      'Launch beta program with early adopters',
      'Iterate based on user feedback',
      'Develop go-to-market strategy',
      'Scale customer acquisition',
      'Expand feature set based on demand'
    ],
    first_steps: [
      'Research the competitive landscape',
      'Identify and interview 10-20 potential customers',
      'Create landing page to test demand',
      'Build basic prototype or wireframes',
      'Set up tracking and analytics'
    ]
  };
}

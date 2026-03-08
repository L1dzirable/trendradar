import { Opportunity } from '../types/opportunity';

export interface ExecutionDetails {
  problem: string;
  target_customer: string;
  solution: string;
  revenue_model: string;
  mvp_7_days: string[];
  customer_acquisition: string[];
}

export function generateExecutionPlan(opportunity: Opportunity): ExecutionDetails {
  if (
    opportunity.problem &&
    opportunity.target_customer &&
    opportunity.solution &&
    opportunity.revenue_model &&
    opportunity.mvp_7_days &&
    opportunity.customer_acquisition
  ) {
    return {
      problem: opportunity.problem,
      target_customer: opportunity.target_customer,
      solution: opportunity.solution,
      revenue_model: opportunity.revenue_model,
      mvp_7_days: opportunity.mvp_7_days,
      customer_acquisition: opportunity.customer_acquisition,
    };
  }

  const trendContext = opportunity.trend_name.toLowerCase();
  const businessIdea = opportunity.business_idea.toLowerCase();

  const problem = generateProblem(opportunity);
  const target_customer = generateTargetCustomer(opportunity);
  const solution = opportunity.business_idea;
  const revenue_model = opportunity.monetization_strategy;
  const mvp_7_days = generateMVP7Days(opportunity);
  const customer_acquisition = generateCustomerAcquisition(opportunity);

  return {
    problem,
    target_customer,
    solution,
    revenue_model,
    mvp_7_days,
    customer_acquisition,
  };
}

function generateProblem(opportunity: Opportunity): string {
  const trendLower = opportunity.trend_name.toLowerCase();

  if (trendLower.includes('ai') || trendLower.includes('automation')) {
    return `Businesses and individuals struggle with time-consuming manual tasks related to ${opportunity.trend_name}, leading to inefficiency and higher operational costs.`;
  }

  if (trendLower.includes('health') || trendLower.includes('wellness')) {
    return `People lack accessible, personalized solutions for ${opportunity.trend_name}, making it difficult to achieve their health and wellness goals.`;
  }

  if (trendLower.includes('education') || trendLower.includes('learning')) {
    return `Traditional approaches to ${opportunity.trend_name} are outdated, expensive, and don't cater to individual learning styles and needs.`;
  }

  if (trendLower.includes('sustainability') || trendLower.includes('eco')) {
    return `Consumers want to make environmentally conscious choices around ${opportunity.trend_name}, but lack convenient, affordable options.`;
  }

  return `Current solutions for ${opportunity.trend_name} are either too expensive, too complex, or don't adequately address user needs, creating a gap in the market.`;
}

function generateTargetCustomer(opportunity: Opportunity): string {
  const marketOpp = opportunity.market_opportunity?.toLowerCase() || '';
  const trendLower = opportunity.trend_name.toLowerCase();

  if (marketOpp.includes('business') || marketOpp.includes('enterprise') || marketOpp.includes('b2b')) {
    return 'Small to medium-sized businesses (10-500 employees) looking to optimize operations and reduce costs. Decision-makers include operations managers, CTOs, and business owners with budget authority.';
  }

  if (marketOpp.includes('creator') || marketOpp.includes('influencer')) {
    return 'Content creators, influencers, and digital entrepreneurs (ages 22-40) with 10K+ followers looking to monetize their audience and streamline their workflow.';
  }

  if (trendLower.includes('health') || trendLower.includes('fitness')) {
    return 'Health-conscious individuals (ages 25-45) with disposable income, actively seeking convenient solutions to improve their wellbeing and willing to pay for quality products/services.';
  }

  if (trendLower.includes('parent') || trendLower.includes('family')) {
    return 'Modern parents (ages 28-42) with young children, tech-savvy, and looking for solutions that save time while providing value for their families.';
  }

  return 'Early adopters and tech-savvy consumers (ages 25-45) with disposable income who actively seek innovative solutions and are willing to try new products/services.';
}

function generateMVP7Days(opportunity: Opportunity): string[] {
  const trendLower = opportunity.trend_name.toLowerCase();
  const ideaLower = opportunity.business_idea.toLowerCase();

  const isDigitalProduct = ideaLower.includes('platform') || ideaLower.includes('app') || ideaLower.includes('software') || ideaLower.includes('tool');
  const isMarketplace = ideaLower.includes('marketplace') || ideaLower.includes('connect');
  const isService = ideaLower.includes('service') || ideaLower.includes('consulting');

  if (isMarketplace) {
    return [
      'Day 1-2: Set up landing page with Webflow/Carrd explaining value proposition, include waitlist signup',
      'Day 3-4: Manually source 5-10 suppliers/sellers and get their commitment to participate',
      'Day 4-5: Create simple Airtable database to manage listings and basic matching logic',
      'Day 6: Launch on Product Hunt, Reddit, and relevant Facebook groups with manual matching',
      'Day 7: Facilitate first 3-5 transactions manually via email to validate demand and gather feedback',
    ];
  }

  if (isService) {
    return [
      'Day 1: Create compelling landing page with Carrd showcasing service benefits and pricing',
      'Day 2: Set up Calendly for bookings and Stripe for payments',
      'Day 3-4: Create service delivery checklist and basic client questionnaire',
      'Day 5: Launch on LinkedIn, Twitter, and relevant communities with personal outreach',
      'Day 6-7: Deliver service manually to first 2-3 clients, iterate based on feedback',
    ];
  }

  if (isDigitalProduct) {
    return [
      'Day 1-2: Build no-code MVP using Bubble.io or Webflow with core feature only',
      'Day 3: Set up authentication with Supabase and payment with Stripe',
      'Day 4: Create onboarding flow and basic dashboard',
      'Day 5-6: Beta test with 10 users from your network, fix critical bugs',
      'Day 7: Soft launch on Product Hunt and Twitter with special early-bird pricing',
    ];
  }

  return [
    'Day 1-2: Validate demand by creating landing page and collecting 50+ email signups',
    'Day 3-4: Build simplest version possible (no-code tools or manual process)',
    'Day 5: Set up payment processing and basic customer communication',
    'Day 6: Launch to small audience (email list, personal network, one community)',
    'Day 7: Get first 5 paying customers and gather detailed feedback',
  ];
}

function generateCustomerAcquisition(opportunity: Opportunity): string[] {
  const trendLower = opportunity.trend_name.toLowerCase();
  const ideaLower = opportunity.business_idea.toLowerCase();

  const isB2B = ideaLower.includes('business') || ideaLower.includes('enterprise') || ideaLower.includes('saas');
  const isContent = ideaLower.includes('content') || ideaLower.includes('creator');

  if (isB2B) {
    return [
      'LinkedIn outreach: 50 personalized connection requests daily to ideal customer profiles',
      'SEO content: Publish 2-3 in-depth blog posts weekly targeting pain-point keywords',
      'Cold email campaigns: 100 targeted emails/day with personalized value propositions',
      'Industry communities: Provide value in Slack groups, Discord servers, and niche forums',
      'Partnership strategy: Reach out to 5 complementary tools for co-marketing opportunities',
      'Case studies: Turn early wins into compelling testimonials and success stories',
    ];
  }

  if (isContent) {
    return [
      'Twitter/X: Share behind-the-scenes journey, tips, and engage 30+ times daily',
      'TikTok/Instagram Reels: Post short-form content (3-5x/week) showing product in action',
      'YouTube: Weekly tutorial/value videos that naturally showcase your solution',
      'Reddit: Provide genuine value in relevant subreddits without spamming',
      'Email list: Build through lead magnet (free template, guide, or mini-course)',
      'Collaborations: Partner with 3-5 micro-influencers in your niche for shoutouts',
    ];
  }

  return [
    'Product Hunt launch: Prepare comprehensive launch with graphics and community support',
    'SEO-optimized content: Write comparison posts, how-to guides targeting buyer intent keywords',
    'Social proof: Collect and showcase testimonials, reviews, and user-generated content',
    'Community engagement: Be active in Reddit, Facebook groups, Discord servers where target audience hangs out',
    'Paid ads: Start with small budget ($10-20/day) on Facebook/Google targeting specific demographics',
    'Referral program: Offer incentives (discount, free month) for users who bring friends',
  ];
}

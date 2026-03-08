export interface Project {
  id: string;
  user_id: string;
  opportunity_id: string | null;
  title: string;
  current_stage: ProjectStage;
  started_at: string;
  updated_at: string;
  notes: string;
  created_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  stage: ProjectStage;
  completed: boolean;
  completed_at: string | null;
  notes: string;
  created_at: string;
}

export type ProjectStage =
  | 'idea_discovered'
  | 'market_validation'
  | 'customer_discovery'
  | 'mvp_development'
  | 'launch'
  | 'first_revenue';

export const PROJECT_STAGES: { value: ProjectStage; label: string; description: string }[] = [
  {
    value: 'idea_discovered',
    label: 'Idea Discovered',
    description: 'Initial opportunity identified from trend signals'
  },
  {
    value: 'market_validation',
    label: 'Market Validation',
    description: 'Validating market demand and feasibility'
  },
  {
    value: 'customer_discovery',
    label: 'Customer Discovery',
    description: 'Finding and talking to potential customers'
  },
  {
    value: 'mvp_development',
    label: 'MVP Development',
    description: 'Building the minimum viable product'
  },
  {
    value: 'launch',
    label: 'Launch',
    description: 'Launching product to the market'
  },
  {
    value: 'first_revenue',
    label: 'First Revenue',
    description: 'Generating initial revenue from customers'
  }
];

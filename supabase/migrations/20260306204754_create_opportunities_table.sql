/*
  # Create TrendRadar Opportunities Table

  1. New Tables
    - `opportunities`
      - `id` (uuid, primary key) - Unique identifier for each opportunity
      - `trend_name` (text) - Name of the trend
      - `trend_explanation` (text) - Brief explanation of the trend
      - `business_idea` (text) - Business idea based on the trend
      - `monetization_strategy` (text) - How to monetize the idea
      - `difficulty_score` (integer) - Difficulty rating from 1-10
      - `opportunity_score` (integer) - Opportunity rating from 0-100
      - `detailed_explanation` (text) - Detailed explanation for modal view
      - `market_opportunity` (text) - Market opportunity analysis
      - `execution_plan` (jsonb) - Array of execution steps
      - `first_steps` (jsonb) - Array of first steps to take
      - `created_at` (timestamptz) - Timestamp of creation
      
  2. Security
    - Enable RLS on `opportunities` table
    - Add policy for public read access (no auth required for MVP)
    - Add policy for inserting opportunities (for the scan feature)
*/

CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_name text NOT NULL,
  trend_explanation text NOT NULL,
  business_idea text NOT NULL,
  monetization_strategy text NOT NULL,
  difficulty_score integer NOT NULL CHECK (difficulty_score >= 1 AND difficulty_score <= 10),
  opportunity_score integer NOT NULL CHECK (opportunity_score >= 0 AND opportunity_score <= 100),
  detailed_explanation text NOT NULL,
  market_opportunity text NOT NULL,
  execution_plan jsonb NOT NULL DEFAULT '[]'::jsonb,
  first_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view opportunities"
  ON opportunities
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert opportunities"
  ON opportunities
  FOR INSERT
  WITH CHECK (true);
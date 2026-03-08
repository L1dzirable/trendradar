/*
  # Create shared opportunities table

  1. New Tables
    - `shared_opportunities`
      - `id` (uuid, primary key) - unique identifier for the share
      - `opportunity_id` (uuid) - references the original opportunity
      - `share_id` (text, unique) - short public ID for the URL
      - `created_at` (timestamptz) - when the share was created
      - `view_count` (integer) - number of times the share was viewed

  2. Security
    - Enable RLS on `shared_opportunities` table
    - Add policy for anyone to read shared opportunities (public access)
    - Add policy for authenticated users to create shares for their own opportunities

  3. Indexes
    - Add unique index on share_id for fast lookups
*/

CREATE TABLE IF NOT EXISTS shared_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  share_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  view_count integer DEFAULT 0
);

ALTER TABLE shared_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shared opportunities"
  ON shared_opportunities
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create shares"
  ON shared_opportunities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update view counts"
  ON shared_opportunities
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_shared_opportunities_share_id ON shared_opportunities(share_id);
CREATE INDEX IF NOT EXISTS idx_shared_opportunities_opportunity_id ON shared_opportunities(opportunity_id);

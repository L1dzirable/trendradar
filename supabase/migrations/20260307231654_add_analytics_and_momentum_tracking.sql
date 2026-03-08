/*
  # Add Analytics and Momentum Tracking

  1. New Tables
    - `opportunity_views`
      - `id` (uuid, primary key)
      - `opportunity_id` (uuid, foreign key to opportunities)
      - `user_id` (uuid, nullable, foreign key to auth.users)
      - `viewed_at` (timestamptz)
      - `session_id` (text) - for anonymous tracking
    
    - `opportunity_shares`
      - `id` (uuid, primary key)
      - `opportunity_id` (uuid, foreign key to opportunities)
      - `user_id` (uuid, nullable, foreign key to auth.users)
      - `shared_at` (timestamptz)
      - `platform` (text) - e.g., 'twitter', 'linkedin', 'copy_link'
    
    - `opportunity_stats`
      - `opportunity_id` (uuid, primary key, foreign key to opportunities)
      - `view_count` (integer)
      - `share_count` (integer)
      - `favorite_count` (integer)
      - `last_viewed_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Updates to Opportunities Table
    - Add `momentum_score` (integer) - calculated field for momentum indicator
    - Add `is_trending` (boolean) - flag for trending opportunities
    - Add `scan_batch_id` (uuid) - to group opportunities from same scan

  3. Security
    - Enable RLS on all new tables
    - Add policies for read access (public for stats, authenticated for tracking)
    - Add policies for insert access (authenticated users can track actions)

  4. Indexes
    - Add indexes for common queries (by opportunity_id, by view count, by date)
*/

CREATE TABLE IF NOT EXISTS opportunity_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  viewed_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opportunity_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  platform text NOT NULL DEFAULT 'copy_link',
  shared_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opportunity_stats (
  opportunity_id uuid PRIMARY KEY REFERENCES opportunities(id) ON DELETE CASCADE,
  view_count integer DEFAULT 0,
  share_count integer DEFAULT 0,
  favorite_count integer DEFAULT 0,
  last_viewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'momentum_score'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN momentum_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'is_trending'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN is_trending boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'scan_batch_id'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN scan_batch_id uuid;
  END IF;
END $$;

ALTER TABLE opportunity_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view opportunity stats"
  ON opportunity_stats FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view opportunity views"
  ON opportunity_views FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view opportunity shares"
  ON opportunity_shares FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert opportunity views"
  ON opportunity_views FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert shares"
  ON opportunity_shares FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update opportunity stats"
  ON opportunity_stats FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "System can modify opportunity stats"
  ON opportunity_stats FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_opportunity_views_opportunity_id ON opportunity_views(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_views_viewed_at ON opportunity_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunity_shares_opportunity_id ON opportunity_shares(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_stats_view_count ON opportunity_stats(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_opportunity_stats_last_viewed ON opportunity_stats(last_viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_momentum_score ON opportunities(momentum_score DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_scan_batch ON opportunities(scan_batch_id);

CREATE OR REPLACE FUNCTION update_opportunity_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO opportunity_stats (opportunity_id, view_count, last_viewed_at, updated_at)
  VALUES (NEW.opportunity_id, 1, NEW.viewed_at, now())
  ON CONFLICT (opportunity_id)
  DO UPDATE SET
    view_count = opportunity_stats.view_count + 1,
    last_viewed_at = NEW.viewed_at,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_share_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO opportunity_stats (opportunity_id, share_count, updated_at)
  VALUES (NEW.opportunity_id, 1, now())
  ON CONFLICT (opportunity_id)
  DO UPDATE SET
    share_count = opportunity_stats.share_count + 1,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_opportunity_stats ON opportunity_views;
CREATE TRIGGER trigger_update_opportunity_stats
  AFTER INSERT ON opportunity_views
  FOR EACH ROW
  EXECUTE FUNCTION update_opportunity_stats();

DROP TRIGGER IF EXISTS trigger_update_share_stats ON opportunity_shares;
CREATE TRIGGER trigger_update_share_stats
  AFTER INSERT ON opportunity_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_share_stats();

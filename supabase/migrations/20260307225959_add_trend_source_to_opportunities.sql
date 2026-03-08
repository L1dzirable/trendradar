/*
  # Add trend source tracking to opportunities

  1. Changes
    - Add `trend_source` column to opportunities table to track where the trend came from
    - Add `trend_source_url` column to store the original source URL if available
    - Add index on trend_source for filtering

  2. Security
    - No RLS changes needed as existing policies cover the new columns
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'trend_source'
  ) THEN
    ALTER TABLE opportunities 
    ADD COLUMN trend_source text DEFAULT 'ai_generated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'trend_source_url'
  ) THEN
    ALTER TABLE opportunities 
    ADD COLUMN trend_source_url text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_opportunities_trend_source ON opportunities(trend_source);

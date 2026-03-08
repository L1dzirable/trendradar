/*
  # Add Trend Score System to Opportunities

  1. New Columns
    - `trend_score` (integer) - Overall trend score from 0-100
    - `market_growth_score` (integer) - Market growth indicator (0-100)
    - `competition_level_score` (integer) - Competition level indicator (0-100)
    - `execution_difficulty_score` (integer) - Execution difficulty indicator (0-100)

  2. Updates
    - Add columns to existing opportunities table
    - Set default values for existing records
    - Add check constraints to ensure scores are between 0 and 100

  3. Notes
    - Trend score is calculated based on market growth, competition, and execution difficulty
    - Higher market growth = better
    - Lower competition = better
    - Lower execution difficulty = better
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'trend_score'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN trend_score integer DEFAULT 70;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'market_growth_score'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN market_growth_score integer DEFAULT 75;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'competition_level_score'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN competition_level_score integer DEFAULT 60;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'execution_difficulty_score'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN execution_difficulty_score integer DEFAULT 65;
  END IF;
END $$;

ALTER TABLE opportunities
  ADD CONSTRAINT check_trend_score CHECK (trend_score >= 0 AND trend_score <= 100),
  ADD CONSTRAINT check_market_growth_score CHECK (market_growth_score >= 0 AND market_growth_score <= 100),
  ADD CONSTRAINT check_competition_level_score CHECK (competition_level_score >= 0 AND competition_level_score <= 100),
  ADD CONSTRAINT check_execution_difficulty_score CHECK (execution_difficulty_score >= 0 AND execution_difficulty_score <= 100);

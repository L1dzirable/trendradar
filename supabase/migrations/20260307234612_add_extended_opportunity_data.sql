/*
  # Add Extended Opportunity Data

  1. Changes
    - Add columns to opportunities table for new features:
      - `customer_discovery` (jsonb) - Customer discovery data (Reddit, Twitter, communities)
      - `competitors` (jsonb) - Competitor snapshot data
      - `landing_page_copy` (jsonb) - Generated landing page content
      - `startup_roadmap` (jsonb) - Day-by-day roadmap
      
  2. Notes
    - Using JSONB for flexible structured data
    - These fields will be populated by AI or manually
*/

-- Add new columns to opportunities table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'customer_discovery'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN customer_discovery jsonb DEFAULT '{"reddit": [], "twitter": [], "communities": [], "forums": []}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'competitors'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN competitors jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'landing_page_copy'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN landing_page_copy jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'opportunities' AND column_name = 'startup_roadmap'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN startup_roadmap jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
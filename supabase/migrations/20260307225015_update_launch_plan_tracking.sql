/*
  # Update Launch Plan Tracking

  1. Changes
    - Add `launch_plans_generated_today` column to user_profiles table to track daily usage
    - Add `last_launch_plan_date` column to track when the count should reset
    - Update launch_plan_usage table structure if needed
  
  2. Security
    - Policies already exist on tables
*/

-- Add usage tracking columns to user_profiles table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'launch_plans_generated_today'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN launch_plans_generated_today integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'last_launch_plan_date'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_launch_plan_date date;
  END IF;
END $$;

-- Create index for better query performance on launch_plan_usage
CREATE INDEX IF NOT EXISTS idx_launch_plan_usage_user_id ON launch_plan_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_launch_plan_usage_generated_at ON launch_plan_usage(generated_at);
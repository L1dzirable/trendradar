/*
  # Update Subscription Schema

  1. Changes
    - Update user_profiles table to match new simpler structure
    - Rename columns to match updated types
    - subscription_status is now 'free' or 'pro'
    - Rename customer_id to stripe_customer_id
    - Rename subscription_id to stripe_subscription_id
    - Rename current_period_end to subscription_expires_at
    - Remove cancel_at_period_end column

  2. Notes
    - This migration safely updates the schema
    - Uses IF EXISTS checks to avoid errors
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE user_profiles RENAME COLUMN customer_id TO stripe_customer_id;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'subscription_id'
  ) THEN
    ALTER TABLE user_profiles RENAME COLUMN subscription_id TO stripe_subscription_id;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'current_period_end'
  ) THEN
    ALTER TABLE user_profiles RENAME COLUMN current_period_end TO subscription_expires_at;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'cancel_at_period_end'
  ) THEN
    ALTER TABLE user_profiles DROP COLUMN cancel_at_period_end;
  END IF;
END $$;

DROP INDEX IF EXISTS idx_user_profiles_subscription_id;
DROP INDEX IF EXISTS idx_user_profiles_customer_id;

CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_subscription_id ON user_profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id ON user_profiles(stripe_customer_id);
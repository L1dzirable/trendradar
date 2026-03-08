/*
  # Add Subscription Fields to Users

  1. Changes
    - Add subscription_status column to track user plan (free or pro)
    - Add stripe_customer_id to link users to Stripe customers
    - Add stripe_subscription_id to track active subscriptions
    - Add subscription_expires_at for subscription end date

  2. Security
    - Users can view their own subscription status
    - Only system can update subscription fields
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'subscription_status'
  ) THEN
    CREATE TABLE IF NOT EXISTS user_profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      subscription_status text NOT NULL DEFAULT 'free',
      stripe_customer_id text,
      stripe_subscription_id text,
      subscription_expires_at timestamptz,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view own profile"
      ON user_profiles FOR SELECT
      TO authenticated
      USING (auth.uid() = id);

    CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer ON user_profiles(stripe_customer_id);
    CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription ON user_profiles(stripe_subscription_id);
  END IF;
END $$;
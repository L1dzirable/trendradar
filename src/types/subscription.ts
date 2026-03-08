export interface UserProfile {
  id: string;
  subscription_status: 'free' | 'pro';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

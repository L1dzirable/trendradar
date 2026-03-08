import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function syncSubscriptions() {
  try {
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .not('stripe_customer_id', 'is', null);

    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }

    console.log(`Found ${profiles.length} profiles with Stripe customer IDs\n`);

    for (const profile of profiles) {
      console.log(`\nChecking customer: ${profile.stripe_customer_id}`);

      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];
        console.log(`  Found subscription: ${subscription.id}`);
        console.log(`  Status: ${subscription.status}`);
        console.log(`  Current period end: ${new Date(subscription.current_period_end * 1000).toISOString()}`);

        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            subscription_status: subscription.status === 'active' ? 'pro' : 'free',
            stripe_subscription_id: subscription.id,
            plan: subscription.status === 'active' ? 'pro' : 'free',
            subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error(`  Error updating profile:`, updateError);
        } else {
          console.log(`  ✓ Updated user ${profile.id} to ${subscription.status === 'active' ? 'pro' : 'free'}`);
        }
      } else {
        console.log(`  No active subscriptions found`);
      }
    }

    console.log('\n✓ Sync complete');
  } catch (error) {
    console.error('Sync error:', error);
  }
}

syncSubscriptions();

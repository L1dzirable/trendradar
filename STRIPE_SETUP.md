# Stripe Setup Guide

## Step 1: Create a Product in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/products)
2. Click **"+ Add product"**
3. Fill in the details:
   - **Name**: TrendRadar Pro
   - **Description**: Premium subscription with unlimited AI-powered trend scanning
   - **Pricing model**: Recurring
   - **Price**: $19.00 USD
   - **Billing period**: Monthly
4. Click **"Save product"**
5. Copy the **Price ID** (starts with `price_`)

## Step 2: Configure Environment Variables

Add the following to your `.env` file:

```
STRIPE_PRICE_ID=price_xxxxxxxxxxxxx
```

Replace `price_xxxxxxxxxxxxx` with the Price ID you copied from Step 1.

## Step 3: Set Up Webhook

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"+ Add endpoint"**
3. Enter your webhook URL:
   ```
   https://your-project-ref.supabase.co/functions/v1/subscription-webhook
   ```
   Replace `your-project-ref` with your actual Supabase project reference
4. Click **"Select events"** and add these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Click on your newly created endpoint
7. Click **"Reveal"** next to "Signing secret"
8. Copy the webhook signing secret (starts with `whsec_`)

## Step 4: Add Webhook Secret

The webhook secret needs to be added as an environment variable for your Edge Functions.

Use the Supabase CLI or Dashboard to set:

```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

Replace `whsec_xxxxxxxxxxxxx` with the signing secret you copied from Step 3.

## Step 5: Test the Integration

1. Sign up for an account in your app
2. Click the "Upgrade" button
3. Complete the test payment using Stripe's test card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
4. After successful payment, you should see the PRO badge in the header
5. Click the settings icon to access the billing portal

## Webhook Events Flow

- **customer.subscription.created/updated** → Sets user to 'pro' status
- **customer.subscription.deleted** → Reverts user to 'free' status
- **invoice.payment_succeeded** → Confirms 'pro' status
- **invoice.payment_failed** → Reverts user to 'free' status

## Troubleshooting

If the subscription status isn't updating:
1. Check the webhook endpoint is receiving events in Stripe Dashboard
2. Check Edge Function logs in Supabase Dashboard
3. Verify the webhook secret is correctly configured
4. Ensure the webhook URL uses your correct Supabase project reference

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2024-12-18.acacia",
    });

    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!signature || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: "Missing signature or webhook secret" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const profileResponse = await fetch(
          `${supabaseUrl}/rest/v1/user_profiles?stripe_customer_id=eq.${customerId}&select=id`,
          {
            headers: {
              apikey: supabaseServiceKey!,
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
          }
        );

        const profiles = await profileResponse.json();
        if (profiles && profiles.length > 0) {
          const userId = profiles[0].id;

          await fetch(
            `${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}`,
            {
              method: "PATCH",
              headers: {
                apikey: supabaseServiceKey!,
                Authorization: `Bearer ${supabaseServiceKey}`,
                "Content-Type": "application/json",
                Prefer: "return=minimal",
              },
              body: JSON.stringify({
                subscription_status: subscription.status === "active" ? "pro" : "free",
                stripe_subscription_id: subscription.id,
                subscription_expires_at: new Date(
                  subscription.current_period_end * 1000
                ).toISOString(),
                updated_at: new Date().toISOString(),
              }),
            }
          );

          console.log(`Subscription updated for user ${userId}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const profileResponse = await fetch(
          `${supabaseUrl}/rest/v1/user_profiles?stripe_customer_id=eq.${customerId}&select=id`,
          {
            headers: {
              apikey: supabaseServiceKey!,
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
          }
        );

        const profiles = await profileResponse.json();
        if (profiles && profiles.length > 0) {
          const userId = profiles[0].id;

          await fetch(
            `${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}`,
            {
              method: "PATCH",
              headers: {
                apikey: supabaseServiceKey!,
                Authorization: `Bearer ${supabaseServiceKey}`,
                "Content-Type": "application/json",
                Prefer: "return=minimal",
              },
              body: JSON.stringify({
                subscription_status: "free",
                stripe_subscription_id: null,
                subscription_expires_at: null,
                updated_at: new Date().toISOString(),
              }),
            }
          );

          console.log(`Subscription cancelled for user ${userId}`);
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription" && session.subscription) {
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          console.log(`Checkout completed for customer ${customerId}, subscription: ${subscriptionId}`);

          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          const profileResponse = await fetch(
            `${supabaseUrl}/rest/v1/user_profiles?stripe_customer_id=eq.${customerId}&select=id`,
            {
              headers: {
                apikey: supabaseServiceKey!,
                Authorization: `Bearer ${supabaseServiceKey}`,
              },
            }
          );

          const profiles = await profileResponse.json();
          if (profiles && profiles.length > 0) {
            const userId = profiles[0].id;

            const updateResponse = await fetch(
              `${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}`,
              {
                method: "PATCH",
                headers: {
                  apikey: supabaseServiceKey!,
                  Authorization: `Bearer ${supabaseServiceKey}`,
                  "Content-Type": "application/json",
                  Prefer: "return=minimal",
                },
                body: JSON.stringify({
                  subscription_status: "pro",
                  stripe_subscription_id: subscription.id,
                  plan: "pro",
                  subscription_expires_at: new Date(
                    subscription.current_period_end * 1000
                  ).toISOString(),
                  updated_at: new Date().toISOString(),
                }),
              }
            );

            console.log(`Updated user ${userId} to pro subscription. Response status: ${updateResponse.status}`);
          } else {
            console.error(`No user profile found for customer ${customerId}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

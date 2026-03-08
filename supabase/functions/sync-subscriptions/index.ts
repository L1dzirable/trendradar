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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_profiles?select=*&stripe_customer_id=not.is.null`,
      {
        headers: {
          apikey: supabaseServiceKey!,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    );

    const profiles = await profileResponse.json();
    console.log(`Found ${profiles.length} profiles with Stripe customer IDs`);

    const updates = [];

    for (const profile of profiles) {
      console.log(`Checking customer: ${profile.stripe_customer_id}`);

      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];
        console.log(`  Found subscription: ${subscription.id}, status: ${subscription.status}`);

        const updateResponse = await fetch(
          `${supabaseUrl}/rest/v1/user_profiles?id=eq.${profile.id}`,
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
              plan: subscription.status === "active" ? "pro" : "free",
              subscription_expires_at: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              updated_at: new Date().toISOString(),
            }),
          }
        );

        updates.push({
          userId: profile.id,
          subscriptionId: subscription.id,
          status: subscription.status,
          updated: updateResponse.ok,
        });

        console.log(`  Updated user ${profile.id} to ${subscription.status === "active" ? "pro" : "free"}`);
      } else {
        console.log(`  No active subscriptions found`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        profilesChecked: profiles.length,
        updates
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Sync error:", error);
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

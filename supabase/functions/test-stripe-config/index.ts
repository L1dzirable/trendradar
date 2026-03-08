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
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripePriceId = Deno.env.get("STRIPE_PRICE_ID");

    const results: any = {
      environment_variables: {
        STRIPE_SECRET_KEY: stripeSecretKey ? "✓ Set" : "✗ Missing",
        STRIPE_PRICE_ID: stripePriceId ? "✓ Set" : "✗ Missing",
        STRIPE_WEBHOOK_SECRET: Deno.env.get("STRIPE_WEBHOOK_SECRET") ? "✓ Set" : "✗ Missing"
      }
    };

    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "STRIPE_SECRET_KEY not configured", results }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!stripePriceId) {
      return new Response(
        JSON.stringify({ error: "STRIPE_PRICE_ID not configured", results }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if STRIPE_PRICE_ID format is correct
    results.price_id_format = {
      value: stripePriceId,
      starts_with_price: stripePriceId.startsWith("price_"),
      starts_with_prod: stripePriceId.startsWith("prod_"),
      status: stripePriceId.startsWith("price_") ? "✓ Correct format" : "✗ Should start with 'price_'"
    };

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    });

    // Test 1: Verify Stripe API key works
    try {
      const account = await stripe.accounts.retrieve();
      results.stripe_api_test = {
        status: "✓ Success",
        account_id: account.id
      };
    } catch (error: any) {
      results.stripe_api_test = {
        status: "✗ Failed",
        error: error.message
      };
    }

    // Test 2: Try to retrieve the price
    try {
      const price = await stripe.prices.retrieve(stripePriceId);
      results.price_retrieval = {
        status: "✓ Success",
        price_id: price.id,
        product_id: price.product,
        amount: price.unit_amount,
        currency: price.currency,
        type: price.type,
        interval: price.recurring?.interval || "one-time"
      };
    } catch (error: any) {
      results.price_retrieval = {
        status: "✗ Failed",
        error: error.message,
        suggestion: stripePriceId.startsWith("prod_")
          ? "The ID starts with 'prod_' which is a product ID. You need to use a price ID that starts with 'price_' instead."
          : "Unable to retrieve price. Check if the price ID exists in your Stripe dashboard."
      };
    }

    // Test 3: Try to create a test checkout session (without customer)
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: "http://localhost:5173/",
        cancel_url: "http://localhost:5173/",
      });

      results.checkout_session_test = {
        status: "✓ Success",
        session_id: session.id,
        message: "Successfully created a test checkout session with the configured price ID"
      };
    } catch (error: any) {
      results.checkout_session_test = {
        status: "✗ Failed",
        error: error.message
      };
    }

    return new Response(
      JSON.stringify(results, null, 2),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error testing Stripe config:", error);
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

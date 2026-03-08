#!/bin/bash

SUPABASE_URL="https://eejshasthrjrpqllovcz.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlanNoYXN0aHJqcnBxbGxvdmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTA5MDgsImV4cCI6MjA4ODQ2NjkwOH0.9smWt5QHgQeGzRa9i-ZEQac_ForThEU5BMpuYZJX7Mw"

echo "Creating test user..."

# Create a test user
SIGNUP_RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/signup" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test-$(date +%s)@example.com\",\"password\":\"testpassword123\"}")

ACCESS_TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "✗ Failed to create user"
  echo "$SIGNUP_RESPONSE"
  exit 1
fi

echo "✓ User created successfully"
echo "Access Token: ${ACCESS_TOKEN:0:50}..."

sleep 2

echo ""
echo "Testing create-subscription edge function..."

# Test the edge function
FUNCTION_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
  "${SUPABASE_URL}/functions/v1/create-subscription" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -H "origin: http://localhost:5173")

HTTP_BODY=$(echo "$FUNCTION_RESPONSE" | sed -e 's/HTTP_STATUS\:.*//g')
HTTP_STATUS=$(echo "$FUNCTION_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

echo "Response Status: $HTTP_STATUS"
echo "Response Body: $HTTP_BODY"

if [ "$HTTP_STATUS" = "200" ]; then
  echo ""
  echo "✓ SUCCESS: Stripe checkout session created!"
  SESSION_ID=$(echo $HTTP_BODY | grep -o '"sessionId":"[^"]*' | cut -d'"' -f4)
  echo "Session ID: $SESSION_ID"
elif echo "$HTTP_BODY" | grep -q "prod_"; then
  echo ""
  echo "⚠ ISSUE DETECTED: The error suggests STRIPE_PRICE_ID is using a product ID (prod_) instead of a price ID (price_)"
else
  echo ""
  echo "✗ ERROR from Stripe:"
  echo "$HTTP_BODY"
fi

// Test script to verify the create-subscription edge function
import https from 'https';

const SUPABASE_URL = 'https://eejshasthrjrpqllovcz.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlanNoYXN0aHJqcnBxbGxvdmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTA5MDgsImV4cCI6MjA4ODQ2NjkwOH0.9smWt5QHgQeGzRa9i-ZEQac_ForThEU5BMpuYZJX7Mw';

// First, create a test user
console.log('Creating test user...');

const signUpData = JSON.stringify({
  email: `test-${Date.now()}@example.com`,
  password: 'testpassword123'
});

const signUpOptions = {
  hostname: 'eejshasthrjrpqllovcz.supabase.co',
  port: 443,
  path: '/auth/v1/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': signUpData.length,
    'apikey': ANON_KEY
  }
};

const signUpReq = https.request(signUpOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const result = JSON.parse(data);

    if (result.access_token) {
      console.log('✓ User created successfully');
      console.log(`User ID: ${result.user.id}`);

      // Now test the create-subscription function
      console.log('\nTesting create-subscription edge function...');

      // Wait a moment for the user to be fully created
      setTimeout(() => {
        const functionOptions = {
          hostname: 'eejshasthrjrpqllovcz.supabase.co',
          port: 443,
          path: '/functions/v1/create-subscription',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${result.access_token}`,
            'apikey': ANON_KEY,
            'origin': 'http://localhost:5173'
          }
        };

      const functionReq = https.request(functionOptions, (funcRes) => {
        let funcData = '';

        funcRes.on('data', (chunk) => {
          funcData += chunk;
        });

        funcRes.on('end', () => {
          console.log(`\nResponse Status: ${funcRes.statusCode}`);
          console.log(`Response Body: ${funcData}`);

          try {
            const funcResult = JSON.parse(funcData);

            if (funcRes.statusCode === 200 && funcResult.sessionId) {
              console.log('\n✓ SUCCESS: Stripe checkout session created!');
              console.log(`Session ID: ${funcResult.sessionId}`);
              console.log(`Checkout URL: ${funcResult.url}`);
            } else if (funcResult.error) {
              console.log('\n✗ ERROR from Stripe:');
              console.log(funcResult.error);

              if (funcResult.error.includes('prod_')) {
                console.log('\n⚠ ISSUE DETECTED: The error suggests STRIPE_PRICE_ID might be using a product ID (prod_) instead of a price ID (price_)');
              }
            }
          } catch (e) {
            console.log('\n✗ Failed to parse response:', funcData);
          }
        });
      });

        functionReq.on('error', (e) => {
          console.error(`✗ Request error: ${e.message}`);
        });

        functionReq.end();
      }, 1000); // Wait 1 second

    } else {
      console.log('✗ Failed to create user:', result);
    }
  });
});

signUpReq.on('error', (e) => {
  console.error(`✗ Request error: ${e.message}`);
});

signUpReq.write(signUpData);
signUpReq.end();

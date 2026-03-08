# Environment Variables Configuration

This document explains all environment variables required for TrendRadar and where to configure them in Bolt.

## Client-Side Environment Variables (Already Configured)

These variables are automatically configured by Bolt and stored in the `.env` file:

### `VITE_SUPABASE_URL`
- **Description**: Your Supabase project URL
- **Location**: `.env` file (already configured)
- **Type**: Public/Client-side
- **Example**: `https://your-project.supabase.co`

### `VITE_SUPABASE_ANON_KEY`
- **Description**: Your Supabase anonymous (public) API key
- **Location**: `.env` file (already configured)
- **Type**: Public/Client-side
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Server-Side Environment Variables (Secure)

These variables must be configured as **Supabase Edge Function secrets** and are never exposed to the client:

### `OPENAI_API_KEY` (REQUIRED)
- **Description**: Your OpenAI API key for generating business opportunities
- **Type**: Server-side secret
- **Security**: Never exposed to client-side code

#### How to Add in Bolt:

1. **Get your OpenAI API key:**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key (starts with `sk-...`)

2. **Add to Bolt:**
   - Click the **"Settings" icon** (gear icon) in the top-right corner of Bolt
   - Navigate to **"Environment Variables"** or **"Secrets"** section
   - Click **"Add Secret"** or **"Add Environment Variable"**
   - Enter:
     - **Name**: `OPENAI_API_KEY`
     - **Value**: Your OpenAI API key (e.g., `sk-proj-...`)
     - **Scope**: Select "Edge Functions" or "Server-side only"
   - Click **"Save"**

3. **The secret is automatically deployed** to your Supabase Edge Functions and is immediately available.

## Architecture

### Secure Flow:
1. User clicks "Scan Trends" in the browser
2. Frontend calls Supabase Edge Function (`/functions/v1/generate-opportunity`)
3. Edge Function uses server-side `OPENAI_API_KEY` to call OpenAI API
4. Generated opportunity is returned to the frontend
5. Frontend saves opportunity to Supabase database

### Why This Is Secure:
- OpenAI API key is **never** sent to the browser
- API key is stored securely on the server
- Only authenticated Supabase requests can call the Edge Function
- No risk of API key exposure in client-side code or browser DevTools

## Summary

| Variable | Type | Location | Already Set? |
|----------|------|----------|--------------|
| `VITE_SUPABASE_URL` | Client | `.env` file | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Client | `.env` file | ✅ Yes |
| `OPENAI_API_KEY` | Server | Bolt Settings → Secrets | ❌ You must add |

## Important Notes

- **Do NOT add `OPENAI_API_KEY` to the `.env` file** - it would expose your API key in the browser
- **Do NOT use `VITE_` prefix** for server-side secrets
- The OpenAI package is **only used in the Edge Function**, not in the client code
- All secrets are automatically deployed when you configure them in Bolt settings

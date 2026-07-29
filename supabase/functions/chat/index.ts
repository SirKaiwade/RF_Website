// Supabase Edge Function: proxies Nexus chat requests to Anthropic so the
// API key never ships to the browser.
//
// Deploy with:
//   supabase functions deploy chat
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// src/lib/nexus.ts posts the exact `messages.create` request body here
// (model, max_tokens, system, tools, tool_choice, messages) and returns the
// Anthropic response body unchanged — the client-side parsing logic doesn't
// need to know or care whether the SDK ran here or in the browser.

import Anthropic from 'npm:@anthropic-ai/sdk@0.104.1';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
const client = apiKey ? new Anthropic({ apiKey }) : null;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  if (!client) {
    return json({ error: 'ANTHROPIC_API_KEY is not set for this Supabase project.' }, 500);
  }

  try {
    const payload = await req.json();
    const response = await client.messages.create(payload);
    return json(response);
  } catch (err) {
    console.error('[Nexus chat function]', err);
    const message = err instanceof Error ? err.message : 'Unknown error calling Anthropic.';
    return json({ error: message }, 500);
  }
});

// Supabase Edge Function: privileged admin actions (delete Auth users).
//
// Deploy:
//   supabase functions deploy admin
//
// Requires service role (auto-injected as SUPABASE_SERVICE_ROLE_KEY in hosted
// functions). Caller must be a signed-in bootstrap/admin user.

import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BOOTSTRAP_ADMINS = new Set(['ayhnassef@unu.edu']);

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

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
  if (!supabaseUrl || !serviceKey || !anonKey) {
    return json({ error: 'Supabase env is incomplete for admin function.' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Missing Authorization' }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user?.email) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const email = user.email.trim().toLowerCase();
  const admin = createClient(supabaseUrl, serviceKey);

  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('email', email)
    .maybeSingle();

  const isAdmin = BOOTSTRAP_ADMINS.has(email) || Boolean(profile?.is_admin);
  if (!isAdmin) {
    return json({ error: 'Admin only' }, 403);
  }

  try {
    const body = await req.json();
    const action = body?.action as string;

    if (action === 'delete_user') {
      const targetEmail = String(body.email ?? '')
        .trim()
        .toLowerCase();
      const userId = String(body.user_id ?? '');
      if (!targetEmail || !userId) {
        return json({ error: 'email and user_id required' }, 400);
      }
      if (BOOTSTRAP_ADMINS.has(targetEmail)) {
        return json({ error: 'Cannot delete bootstrap admin' }, 400);
      }

      const { error: delError } = await admin.auth.admin.deleteUser(userId);
      // Profile may remain for audit; soft-disable is done client-side.
      if (delError) {
        // Try lookup by email if id mismatch
        const { data: listed } = await admin.auth.admin.listUsers({ perPage: 1000 });
        const match = listed?.users?.find((u) => u.email?.toLowerCase() === targetEmail);
        if (match) {
          const { error: del2 } = await admin.auth.admin.deleteUser(match.id);
          if (del2) return json({ error: del2.message }, 500);
        } else {
          return json({ error: delError.message, soft_only: true }, 200);
        }
      }
      return json({ ok: true, deleted: targetEmail });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    console.error('[Nexus admin function]', err);
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});

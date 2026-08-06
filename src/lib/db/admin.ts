import { getSupabase, supabaseConfigured } from '../supabase';
import {
  BOOTSTRAP_ADMIN_EMAILS,
  isBootstrapAdmin,
  normalizeLibraryRole,
  type LibraryRole,
} from '../permissions';
import { getOrCreateProfileId } from './profiles';

export interface ProfileRecord {
  id: string;
  email: string;
  display_name: string | null;
  is_admin: boolean;
  library_role: LibraryRole;
  disabled_at: string | null;
  disabled_reason: string | null;
  created_at: string;
}

export interface BannedEmailRecord {
  email: string;
  reason: string | null;
  banned_by: string | null;
  banned_at: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function mapProfile(row: {
  id: string;
  email: string;
  display_name: string | null;
  is_admin?: boolean | null;
  library_role?: string | null;
  disabled_at?: string | null;
  disabled_reason?: string | null;
  created_at: string;
}): ProfileRecord {
  return {
    id: row.id,
    email: row.email,
    display_name: row.display_name,
    is_admin: Boolean(row.is_admin) || isBootstrapAdmin(row.email),
    library_role: normalizeLibraryRole(row.library_role),
    disabled_at: row.disabled_at ?? null,
    disabled_reason: row.disabled_reason ?? null,
    created_at: row.created_at,
  };
}

export async function fetchProfileByEmail(email: string): Promise<ProfileRecord | null> {
  if (!supabaseConfigured()) return null;
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from('profiles')
    .select('id, email, display_name, is_admin, library_role, disabled_at, disabled_reason, created_at')
    .eq('email', normalizeEmail(email))
    .maybeSingle();
  if (error) {
    const { data: basic } = await sb
      .from('profiles')
      .select('id, email, display_name, created_at')
      .eq('email', normalizeEmail(email))
      .maybeSingle();
    if (!basic) return null;
    return mapProfile({
      ...basic,
      is_admin: isBootstrapAdmin(basic.email),
      library_role: 'edit',
      disabled_at: null,
      disabled_reason: null,
    });
  }
  if (!data) return null;
  return mapProfile(data);
}

export async function ensureBootstrapAdmin(email: string): Promise<void> {
  if (!isBootstrapAdmin(email) || !supabaseConfigured()) return;
  const sb = getSupabase();
  if (!sb) return;
  await getOrCreateProfileId(email);
  const { error } = await sb
    .from('profiles')
    .update({ is_admin: true, library_role: 'edit' })
    .eq('email', normalizeEmail(email));
  if (error && !error.message.includes('is_admin') && !error.message.includes('library_role')) {
    console.warn('[Nexus] ensureBootstrapAdmin:', error.message);
  }
}

export async function isEmailBanned(email: string): Promise<boolean> {
  if (!supabaseConfigured()) return false;
  const sb = getSupabase();
  if (!sb) return false;
  const { data, error } = await sb
    .from('banned_emails')
    .select('email')
    .eq('email', normalizeEmail(email))
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

export async function listProfiles(): Promise<ProfileRecord[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from('profiles')
    .select('id, email, display_name, is_admin, library_role, disabled_at, disabled_reason, created_at')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('[Nexus] listProfiles:', error.message);
    return [];
  }
  return (data ?? []).map(mapProfile);
}

export async function setLibraryRole(
  profileId: string,
  role: LibraryRole
): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase is not configured.' };
  const { error } = await sb
    .from('profiles')
    .update({ library_role: role })
    .eq('id', profileId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function setProfileAdmin(opts: {
  profileId: string;
  email: string;
  isAdmin: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase is not configured.' };
  if (!opts.isAdmin && isBootstrapAdmin(opts.email)) {
    return { ok: false, error: 'Cannot remove admin from the primary administrator account.' };
  }
  const patch: { is_admin: boolean; library_role?: LibraryRole } = {
    is_admin: opts.isAdmin,
  };
  if (opts.isAdmin) patch.library_role = 'edit';
  const { error } = await sb.from('profiles').update(patch).eq('id', opts.profileId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listBannedEmails(): Promise<BannedEmailRecord[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from('banned_emails')
    .select('email, reason, banned_by, banned_at')
    .order('banned_at', { ascending: false });
  if (error) {
    console.warn('[Nexus] listBannedEmails:', error.message);
    return [];
  }
  return data ?? [];
}

export async function banEmail(
  email: string,
  opts: { reason?: string; bannedBy?: string }
): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase is not configured.' };
  const normalized = normalizeEmail(email);
  if ((BOOTSTRAP_ADMIN_EMAILS as readonly string[]).includes(normalized)) {
    return { ok: false, error: 'Cannot ban the bootstrap admin.' };
  }
  const { error } = await sb.from('banned_emails').upsert({
    email: normalized,
    reason: opts.reason?.trim() || null,
    banned_by: opts.bannedBy ? normalizeEmail(opts.bannedBy) : null,
    banned_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function unbanEmail(email: string): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase is not configured.' };
  const { error } = await sb.from('banned_emails').delete().eq('email', normalizeEmail(email));
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function disableProfile(
  profileId: string,
  reason?: string
): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase is not configured.' };
  const { error } = await sb
    .from('profiles')
    .update({
      disabled_at: new Date().toISOString(),
      disabled_reason: reason?.trim() || 'Removed by admin',
      library_role: 'none',
    })
    .eq('id', profileId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function removeUserAccess(opts: {
  profileId: string;
  email: string;
  ban: boolean;
  reason?: string;
  actorEmail: string;
}): Promise<{ ok: boolean; error?: string; hardDeleted?: boolean }> {
  if (isBootstrapAdmin(opts.email)) {
    return { ok: false, error: 'Cannot remove the bootstrap admin.' };
  }

  const disabled = await disableProfile(opts.profileId, opts.reason);
  if (!disabled.ok) return disabled;

  if (opts.ban) {
    const banned = await banEmail(opts.email, {
      reason: opts.reason,
      bannedBy: opts.actorEmail,
    });
    if (!banned.ok) return banned;
  }

  let hardDeleted = false;
  const sb = getSupabase();
  if (sb) {
    try {
      const { data: sessionData } = await sb.auth.getSession();
      const token = sessionData.session?.access_token;
      const base = import.meta.env.VITE_SUPABASE_URL;
      if (token && base) {
        const res = await fetch(`${base}/functions/v1/admin`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'delete_user',
            user_id: opts.profileId,
            email: normalizeEmail(opts.email),
          }),
        });
        if (res.ok) hardDeleted = true;
      }
    } catch {
      // Soft-remove still applied.
    }
  }

  return { ok: true, hardDeleted };
}

/** Paths that are locked, with optional allow-listed profile ids. */
export async function fetchViewersByPath(): Promise<Map<string, Set<string>>> {
  const sb = getSupabase();
  if (!sb) return new Map();

  const map = new Map<string, Set<string>>();

  const { data: locks, error: lockError } = await sb
    .from('library_folder_locks')
    .select('folder_path');
  if (!lockError) {
    for (const row of locks ?? []) {
      map.set(row.folder_path ?? '', new Set());
    }
  }

  const { data, error } = await sb
    .from('library_folder_viewers')
    .select('folder_path, profile_id');
  if (error) return map;

  for (const row of data ?? []) {
    const path = row.folder_path ?? '';
    let set = map.get(path);
    if (!set) {
      set = new Set();
      map.set(path, set);
    }
    set.add(row.profile_id);
  }
  return map;
}

export async function listFolderViewers(
  folderPath: string
): Promise<{
  openToEveryone: boolean;
  viewers: { profile_id: string; email: string; display_name: string | null }[];
}> {
  const sb = getSupabase();
  if (!sb) return { openToEveryone: true, viewers: [] };
  const path = folderPath.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');

  const { data: lock } = await sb
    .from('library_folder_locks')
    .select('folder_path')
    .eq('folder_path', path)
    .maybeSingle();

  if (!lock) return { openToEveryone: true, viewers: [] };

  const { data, error } = await sb
    .from('library_folder_viewers')
    .select('profile_id, profiles(email, display_name)')
    .eq('folder_path', path);
  if (error) {
    console.warn('[Nexus] listFolderViewers:', error.message);
    return { openToEveryone: false, viewers: [] };
  }
  return {
    openToEveryone: false,
    viewers: (data ?? []).map((row) => {
      const profile = row.profiles as unknown as
        | { email: string; display_name: string | null }
        | null;
      return {
        profile_id: row.profile_id,
        email: profile?.email ?? '',
        display_name: profile?.display_name ?? null,
      };
    }),
  };
}

/**
 * Save folder visibility.
 * - `openToEveryone: true` unlocks the folder.
 * - otherwise locks it and sets the allow-list (empty = admins only).
 */
export async function setFolderViewers(opts: {
  folderPath: string;
  openToEveryone: boolean;
  profileIds: string[];
}): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase is not configured.' };
  const path = opts.folderPath.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');

  const { error: delViewers } = await sb
    .from('library_folder_viewers')
    .delete()
    .eq('folder_path', path);
  if (delViewers) return { ok: false, error: delViewers.message };

  if (opts.openToEveryone) {
    const { error: delLock } = await sb
      .from('library_folder_locks')
      .delete()
      .eq('folder_path', path);
    if (delLock) return { ok: false, error: delLock.message };
    return { ok: true };
  }

  const { error: lockError } = await sb
    .from('library_folder_locks')
    .upsert({ folder_path: path });
  if (lockError) return { ok: false, error: lockError.message };

  if (opts.profileIds.length === 0) return { ok: true };

  const rows = opts.profileIds.map((profile_id) => ({
    folder_path: path,
    profile_id,
  }));
  const { error: insError } = await sb.from('library_folder_viewers').insert(rows);
  if (insError) return { ok: false, error: insError.message };
  return { ok: true };
}

export async function isFolderRestricted(folderPath: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const path = folderPath.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  const { data, error } = await sb
    .from('library_folder_locks')
    .select('folder_path')
    .eq('folder_path', path)
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

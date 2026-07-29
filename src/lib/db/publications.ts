import type { Publication } from '../../types';
import { getSupabase, supabaseConfigured } from '../supabase';
import type { PublicationRow } from './types';

function toRow(p: Publication): PublicationRow {
  return {
    id: p.id,
    title: p.title,
    date: p.date,
    first_author: p.firstAuthor,
    other_authors: p.otherAuthors,
    type: p.type,
    outlet: p.outlet,
    link: p.link,
    work_package: p.workPackage,
    target_audience: p.targetAudience,
    global_south: p.globalSouth,
    purpose: p.purpose,
  };
}

function fromRow(row: PublicationRow): Publication {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    firstAuthor: row.first_author,
    otherAuthors: row.other_authors,
    type: row.type,
    outlet: row.outlet,
    link: row.link,
    workPackage: row.work_package,
    targetAudience: row.target_audience,
    globalSouth: row.global_south,
    purpose: row.purpose,
  };
}

export async function loadPublications(): Promise<Publication[] | null> {
  if (!supabaseConfigured()) return null;
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('publications').select('*');
  if (error) {
    console.warn('[Nexus] Could not load publications from Supabase:', error.message);
    return null;
  }
  return (data ?? []).map(fromRow);
}

/** Full-snapshot sync: upsert everything in `publications`, delete anything else. */
export async function syncPublications(publications: Publication[]): Promise<void> {
  if (!supabaseConfigured()) return;
  const sb = getSupabase();
  if (!sb) return;

  if (publications.length > 0) {
    const { error } = await sb.from('publications').upsert(publications.map(toRow));
    if (error) {
      console.warn('[Nexus] Could not sync publications to Supabase:', error.message);
      return;
    }
  }

  const { data: existing } = await sb.from('publications').select('id');
  const keepIds = new Set(publications.map((p) => p.id));
  const staleIds = (existing ?? []).map((r) => r.id).filter((id) => !keepIds.has(id));
  if (staleIds.length > 0) {
    await sb.from('publications').delete().in('id', staleIds);
  }
}

import type { SourceReference } from '../types';

const SUPER_DIGITS: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
};

/** Normalize unicode superscripts (¹ ² ¹⁸) into [n] markers. */
export function normalizeCitationMarkers(content: string): string {
  return content.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (run) => {
    const digits = [...run].map((c) => SUPER_DIGITS[c] ?? '').join('');
    if (!digits) return run;
    const n = parseInt(digits, 10);
    if (!Number.isFinite(n) || n < 1) return run;
    return `[${n}]`;
  });
}

/** Extract 1-based citation numbers from an answer body. */
export function citationNumbersInText(content: string): number[] {
  const normalized = normalizeCitationMarkers(content);
  const found = new Set<number>();
  for (const m of normalized.matchAll(/\[(\d+)\](?!\()/g)) {
    const n = parseInt(m[1], 10);
    if (Number.isFinite(n) && n > 0) found.add(n);
  }
  return [...found].sort((a, b) => a - b);
}

/**
 * Build a sources list for the UI from inline [n] markers + any structured
 * sources the model returned. Gaps become placeholder slots the user can resolve.
 */
export function buildCitationSlots(
  content: string,
  sources: SourceReference[] = []
): SourceReference[] {
  const nums = citationNumbersInText(content);
  const maxFromText = nums.length ? Math.max(...nums) : 0;
  const max = Math.max(maxFromText, sources.length);
  if (max === 0) return [];

  const slots: SourceReference[] = [];
  for (let i = 0; i < max; i++) {
    const existing = sources[i];
    slots.push({
      documentId: existing?.documentId ?? '',
      excerpt: existing?.excerpt ?? '',
      relevanceReason: existing?.relevanceReason ?? '',
    });
  }
  return slots;
}

/** Grab ~local context around citation [n] so the quote resolver knows the claim. */
export function claimContextAroundCitation(
  content: string,
  citationNumber: number,
  radius = 220
): string {
  const normalized = normalizeCitationMarkers(content);
  const marker = `[${citationNumber}]`;
  const idx = normalized.indexOf(marker);
  if (idx < 0) {
    return normalized.slice(0, Math.min(normalized.length, radius * 2));
  }
  const start = Math.max(0, idx - radius);
  const end = Math.min(normalized.length, idx + marker.length + radius);
  let slice = normalized.slice(start, end).replace(/\s+/g, ' ').trim();
  if (start > 0) slice = '…' + slice;
  if (end < normalized.length) slice = slice + '…';
  return slice;
}

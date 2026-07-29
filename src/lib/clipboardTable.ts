/**
 * Parse Excel/Sheets clipboard text (TSV, sometimes CSV) into a string matrix.
 */
export function parseClipboardMatrix(text: string): string[][] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  // Drop a single trailing empty line Excel often adds.
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  if (lines.length === 0) return [];

  const looksCsv =
    !lines.some((l) => l.includes('\t')) &&
    lines.some((l) => l.includes(','));

  return lines.map((line) => (looksCsv ? splitCsvLine(line) : line.split('\t')));
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

/** Serialize a matrix to TSV for copying back into Excel. */
export function toTsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const s = cell ?? '';
          if (/[\t\n\r"]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
          return s;
        })
        .join('\t')
    )
    .join('\n');
}

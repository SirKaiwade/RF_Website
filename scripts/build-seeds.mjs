// Regenerates src/data/*.seed.json from the staff mastersheets.
// Usage: node scripts/build-seeds.mjs <events.xlsx> <publications.xlsx> [...]
// Bundles the app's own parser first so seed data and in-app imports
// always go through identical normalization.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node scripts/build-seeds.mjs <workbook.xlsx> [...]');
  process.exit(1);
}

const tmp = mkdtempSync(join(tmpdir(), 'nexus-seeds-'));
const bundled = join(tmp, 'recordsImport.mjs');
execSync(
  `npx esbuild "${join(root, 'src/lib/recordsImport.ts')}" --bundle --format=esm --outfile="${bundled}"`,
  { stdio: 'inherit' }
);
const { parseTables } = await import(bundled);

const tables = [];
for (const file of files) {
  const wb = XLSX.read(readFileSync(file));
  for (const name of wb.SheetNames) {
    tables.push({
      name,
      rows: XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: null }),
    });
  }
}

const { events, publications, skippedSheets } = parseTables(tables);
writeFileSync(
  join(root, 'src/data/events.seed.json'),
  JSON.stringify(events, null, 2) + '\n'
);
writeFileSync(
  join(root, 'src/data/publications.seed.json'),
  JSON.stringify(publications, null, 2) + '\n'
);
console.log(
  `Wrote ${events.length} events, ${publications.length} publications.` +
    (skippedSheets.length ? ` Skipped sheets: ${skippedSheets.join(', ')}` : '')
);

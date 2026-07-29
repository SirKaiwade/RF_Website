import type { Cell, SheetTable } from './recordsImport';

export function isSpreadsheetFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith('.xlsx') ||
    name.endsWith('.xls') ||
    name.endsWith('.csv') ||
    file.type === 'text/csv' ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel'
  );
}

export async function readSpreadsheet(file: File): Promise<SheetTable[]> {
  // Dynamically imported — xlsx (a large parser) only downloads when someone
  // actually opens a spreadsheet, not on every authenticated page load.
  const XLSX = await import('xlsx');
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf);
  return wb.SheetNames.map((name) => ({
    name,
    rows: XLSX.utils.sheet_to_json<Cell[]>(wb.Sheets[name], {
      header: 1,
      defval: null,
    }),
  }));
}

function cellToText(c: Cell): string {
  if (c == null) return '';
  if (c instanceof Date) return c.toISOString().slice(0, 10);
  return String(c).replace(/\s+/g, ' ').trim();
}

/** Renders a workbook as readable pipe-delimited text so spreadsheets can be
 * attached in chat and searched by the model like any other document. */
export function sheetsToText(tables: SheetTable[]): string {
  const parts: string[] = [];
  for (const table of tables) {
    const rows = table.rows
      .map((row) => row.map(cellToText))
      .filter((row) => row.some((c) => c.length > 0));
    if (rows.length === 0) continue;
    const body = rows.map((row) => {
      // Trim trailing empty columns to keep lines compact.
      let end = row.length;
      while (end > 0 && row[end - 1] === '') end--;
      return row.slice(0, end).join(' | ');
    });
    parts.push(`== Sheet: ${table.name} ==\n${body.join('\n')}`);
  }
  return parts.join('\n\n');
}

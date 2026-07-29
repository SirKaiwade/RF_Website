import {
  DataSheetGrid,
  checkboxColumn,
  isoDateColumn,
  keyColumn,
  textColumn,
} from 'react-datasheet-grid';
import 'react-datasheet-grid/dist/style.css';
import type { Publication } from '../types';
import { PUBLICATION_TYPES, publicationsStore } from '../data/publications';
import { emptyPublicationRow } from '../lib/publicationsGrid';

type PubSheetRow = {
  id: string;
  date: string | null;
  title: string;
  firstAuthor: string;
  otherAuthors: string;
  type: string;
  outlet: string;
  link: string;
  workPackage: string;
  targetAudience: string;
  globalSouth: boolean;
  purpose: string;
};

function toRow(p: Publication): PubSheetRow {
  return {
    id: p.id,
    date: p.date,
    title: p.title,
    firstAuthor: p.firstAuthor ?? '',
    otherAuthors: p.otherAuthors ?? '',
    type: p.type ?? '',
    outlet: p.outlet ?? '',
    link: p.link ?? '',
    workPackage: p.workPackage ?? '',
    targetAudience: p.targetAudience ?? '',
    globalSouth: p.globalSouth === true,
    purpose: p.purpose ?? '',
  };
}

function fromRow(r: PubSheetRow): Publication {
  const title = (r.title ?? '').replace(/\n+/g, ' ').trim();
  return {
    id: r.id || emptyPublicationRow().id,
    title,
    date: r.date || null,
    firstAuthor: r.firstAuthor.trim() || null,
    otherAuthors: r.otherAuthors.trim() || null,
    type: r.type.trim() || null,
    outlet: r.outlet.trim() || null,
    link: r.link.trim() || null,
    workPackage: r.workPackage.trim() || null,
    targetAudience: r.targetAudience.trim() || null,
    globalSouth: r.globalSouth ? true : null,
    purpose: r.purpose.trim() || null,
  };
}

// DSG's generics fight mixed field types on one row; cast the column list once.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: any[] = [
  { ...keyColumn('date', isoDateColumn), title: 'Date', minWidth: 120 },
  { ...keyColumn('title', textColumn), title: 'Title', minWidth: 260, grow: 1.4 },
  { ...keyColumn('firstAuthor', textColumn), title: 'First author', minWidth: 130 },
  { ...keyColumn('otherAuthors', textColumn), title: 'Other authors', minWidth: 160 },
  { ...keyColumn('type', textColumn), title: 'Publication type', minWidth: 170 },
  { ...keyColumn('outlet', textColumn), title: 'Outlet/Publisher', minWidth: 150 },
  { ...keyColumn('link', textColumn), title: 'Link / DOI', minWidth: 180 },
  { ...keyColumn('workPackage', textColumn), title: 'Work Package', minWidth: 130 },
  { ...keyColumn('targetAudience', textColumn), title: 'Target audience', minWidth: 130 },
  { ...keyColumn('globalSouth', checkboxColumn), title: 'Global South', minWidth: 110 },
  { ...keyColumn('purpose', textColumn), title: 'Purpose', minWidth: 220, grow: 1 },
];

interface Props {
  rows: Publication[];
}

export default function PublicationsSheetEditor({ rows }: Props) {
  const data = rows.map(toRow);

  return (
    <div className="publications-sheet">
      <p className="publications-sheet-hint">
        Excel-like grid (react-datasheet-grid) — paste ⌘V / Ctrl+V, copy, arrows, and fill-handle.
        Types include {PUBLICATION_TYPES.slice(0, 4).join(', ')}, and the rest in the key above.
      </p>
      <DataSheetGrid
        value={data}
        onChange={(next) => {
          publicationsStore.hydrate(next.map(fromRow));
        }}
        columns={columns}
        createRow={() => toRow(emptyPublicationRow())}
        duplicateRow={({ rowData }) => ({
          ...rowData,
          id: emptyPublicationRow().id,
        })}
        height={Math.min(560, Math.max(320, 56 + Math.max(data.length, 4) * 36))}
        rowHeight={36}
        headerRowHeight={40}
      />
    </div>
  );
}

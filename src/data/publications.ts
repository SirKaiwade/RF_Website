import type { Publication } from '../types';
import { createRecordsStore } from '../lib/recordsStore';
import seedJson from './publications.seed.json';

// Regenerate publications.seed.json from the mastersheet with:
//   node scripts/build-seeds.mjs "<2026 Publication mastersheet.xlsx>"
export const publicationsSeed = seedJson as Publication[];

export const publicationsStore = createRecordsStore<Publication>(
  'nexus:publications',
  publicationsSeed
);

export const PUBLICATION_TYPE_DEFINITIONS: Record<string, string> = {
  'Journal article': 'Peer-reviewed academic article in a scholarly journal.',
  'Policy brief': 'Short, targeted document translating evidence into policy recommendations.',
  'Research report': 'Comprehensive report presenting original research and analysis.',
  'Briefing paper': 'Concise analytical paper to inform decision-makers or partners.',
  'Technical report': 'Detailed technical or methodological analysis.',
  'Working paper': 'Pre-publication or discussion-stage research output.',
  'Guidance note': 'Practical, implementation-oriented guidance.',
  'Position paper': 'Institutional or expert stance on a policy or issue.',
  'Meeting report': 'Synthesis of discussions and outcomes from a convening.',
  'Evidence synthesis / Review': 'Systematic or narrative review of existing evidence.',
  'Case study': 'Applied learning from a country, programme, or intervention.',
  'Op-ed / Commentary': 'Opinion or agenda-setting piece for public or policy audiences.',
  'Website article': 'Institutional or partner web publication for dissemination.',
  'Policy submission': 'Formal input into consultation or intergovernmental process.',
};

export function getPublication(id: string): Publication | undefined {
  return publicationsStore.get().find((p) => p.id === id);
}

export function formatAuthors(pub: Publication): string {
  return [pub.firstAuthor, pub.otherAuthors].filter(Boolean).join(', ');
}

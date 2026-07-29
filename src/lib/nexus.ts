import Anthropic from '@anthropic-ai/sdk';
import { documents } from '../data/documents';
import { getPeople } from '../data/people';
import { eventsStore } from '../data/events';
import { publicationsStore } from '../data/publications';
import { eventToText, publicationToText } from './corpusText';
import { supabaseConfigured } from './supabase';
import type { UploadedDoc } from './uploads';
import type { ChatMessage } from '../types/chat';
import type { SourceReference } from '../types';

// Haiku — cheapest and fastest. Swap if Anthropic deprecates this alias.
const MODEL = 'claude-haiku-4-5';

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

// Direct-from-browser client — used only when Supabase (and therefore the
// `chat` Edge Function) isn't configured, so local dev keeps working with
// zero setup. Once Supabase is configured, calls route through the Edge
// Function instead so the API key never reaches the browser — see
// callViaEdgeFunction() below and supabase/functions/chat/index.ts.
const client = apiKey
  ? new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  : null;

export function nexusReady(): boolean {
  return supabaseConfigured() || Boolean(client);
}

async function callViaEdgeFunction(
  payload: Anthropic.MessageCreateParamsNonStreaming
): Promise<Anthropic.Message> {
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const res = await fetch(`${url}/functions/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      typeof data?.error === 'string' ? data.error : `Chat function returned ${res.status}.`
    );
  }
  return data as Anthropic.Message;
}

export interface NexusResult {
  answer: string;
  /** Present only when the model actually supplied a score — never fabricated. */
  confidence?: number;
  sources: SourceReference[];
  followUps: string[];
  relatedPeopleIds: string[];
  noAnswer: boolean;
}

function buildSystemPrompt(uploadedDocs: UploadedDoc[]): string {
  const docBlocks = documents
    .map(
      (d) => `<doc id="${d.id}">
  <title>${d.title}</title>
  <type>${d.type}</type>
  <team>${d.team}</team>
  <region>${d.region}</region>
  <owner>${d.ownerId}</owner>
  <status>${d.status}</status>
  <freshness>${d.freshness}</freshness>
  <updated>${d.updatedAt}</updated>
  <topics>${d.topics.join(', ')}</topics>
  <summary>${d.summary}</summary>
  <takeaways>${d.takeaways.map((t) => `- ${t}`).join('\n  ')}</takeaways>${
        d.excerpt ? `\n  <excerpt>${d.excerpt}</excerpt>` : ''
      }
  <related_people>${d.relatedPeopleIds.join(', ')}</related_people>
</doc>`
    )
    .join('\n\n');

  const peopleBlocks = getPeople()
    .map(
      (p) => `<person id="${p.id}">
  <name>${p.name}</name>
  <role>${p.role}</role>
  <team>${p.team}</team>
  <expertise>${p.expertise.join(', ')}</expertise>
</person>`
    )
    .join('\n\n');

  const eventBlocks = eventsStore
    .get()
    .map((e) => `<event id="${e.id}">\n${eventToText(e)}\n</event>`)
    .join('\n\n');

  const publicationBlocks = publicationsStore
    .get()
    .map((p) => `<publication id="${p.id}">\n${publicationToText(p)}\n</publication>`)
    .join('\n\n');

  const uploadedBlocks = uploadedDocs
    .map(
      (u) => `<doc id="${u.id}" source="user-upload">
  <title>${u.filename}</title>
  <type>Uploaded document</type>
  <uploaded_at>${u.uploadedAt}</uploaded_at>${
        u.pageCount ? `\n  <pages>${u.pageCount}</pages>` : ''
      }
  <full_text>${u.text}</full_text>
</doc>`
    )
    .join('\n\n');

  const uploadedSection = uploadedDocs.length
    ? `\n\n<user_uploaded_documents>
The user has uploaded the following document(s) into this session. Treat them as first-class corpus members. They take precedence when the question is clearly about them. Cite them by their id (which starts with "up-") just like any seed doc.

${uploadedBlocks}
</user_uploaded_documents>`
    : '';

  const corpus = `<corpus>\n<documents>\n${docBlocks}\n</documents>\n\n<people>\n${peopleBlocks}\n</people>\n\n<events_2026>\n${eventBlocks}\n</events_2026>\n\n<publications_2026>\n${publicationBlocks}\n</publications_2026>\n</corpus>${uploadedSection}`;

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `You are Nexus, the institutional knowledge layer for UNU-IIGH (United Nations University, International Institute for Global Health).

Today's date is ${today}. Use it to reason about which events are upcoming versus past.

Your job: answer questions about UNU-IIGH's work using ONLY the corpus below. The corpus contains documents (reports, briefs, meeting notes, datasets, etc.), the people behind them, the 2026 events matrix (every convening UNU-IIGH runs or contributes to: conferences, webinars, workshops, policy dialogues, consultations, partnership meetings, and side events), and the 2026 publications database (journal articles, policy briefs, reports, book chapters, and web articles). Events (ids starting "ev-") and publications (ids starting "pub-") are first-class, citable corpus entries — cite them like documents, quoting verbatim from their entry text. The user may also have uploaded session-only documents — those are equally citable.

Rules:
- Ground every claim in the corpus. Never invent facts, dates, names, or findings.
- If the corpus does not contain enough to answer confidently, call the "answer" tool with noAnswer=true and explain in the answer field what is missing and the closest adjacent material.
- Cite every claim inline using [1], [2], [3] markers. The number maps to the position in the sources array (1-indexed).
- For EVERY source you cite, the "excerpt" field MUST be a verbatim, contiguous quote copied character-for-character from that document's text — no paraphrasing, no ellipses inside the quote, no summarising. Pick the single sentence or sentence fragment that most directly supports the claim. 1–3 sentences max. The UI will use this exact string to highlight the passage in the source — if the quote is paraphrased it will fail to highlight and the user will see a warning.
- If you cannot find a verbatim sentence that supports a claim, do not cite it; either drop the claim or set noAnswer=true.
- Use **bold** sparingly for key entities, project names, and findings.
- Order sources by importance to the answer.
- For roll-up questions across the events matrix or publications database (counts, upcoming events, who leads what, reach numbers), synthesise across entries and cite the most relevant individual entries — at most 6 sources. State plainly when many entries have missing fields (e.g. participant counts not yet reported).
- Pick relatedPeopleIds from document owners, related_people fields, or expertise matches. Max 4. Skip this for questions that are purely about uploaded session documents.
- Generate 3 concrete follow-up questions a user would realistically ask next, grounded in the corpus or uploads.
- Confidence: report only when honest. 0.85+ when directly supported by 2+ sources; 0.65-0.84 when synthesised across sources; below 0.65 when partial. Prefer omitting confidence over fabricating one.
- Tone: factual, concise, like a senior colleague briefing you. No marketing voice, no hedging filler.

${corpus}`;
}

const ANSWER_TOOL: Anthropic.Tool = {
  name: 'answer',
  description:
    'Provide a cited answer grounded in the UNU-IIGH corpus. Always call this tool exactly once.',
  input_schema: {
    type: 'object',
    properties: {
      answer: {
        type: 'string',
        description:
          'Markdown answer with **bold** for key entities and inline [1], [2], [3] citations. Use \\n\\n between paragraphs. Use - for bullet lists.',
      },
      confidence: {
        type: 'number',
        description:
          'Optional confidence 0–1 using the rubric. Omit rather than invent a score if you cannot honestly assess grounding.',
      },
      sources: {
        type: 'array',
        description:
          'Sources cited inline by [n]. Order matches inline citation numbers.',
        items: {
          type: 'object',
          properties: {
            documentId: {
              type: 'string',
              description: 'Must exactly match a doc id from the corpus.',
            },
            excerpt: {
              type: 'string',
              description:
                'Verbatim, contiguous quote copied character-for-character from the source document — 1–3 sentences. Must appear in the document text exactly as written. The UI uses this string to highlight the passage in the source viewer.',
            },
            relevanceReason: {
              type: 'string',
              description:
                'One short clause explaining why this source is relevant to the question.',
            },
          },
          required: ['documentId', 'excerpt', 'relevanceReason'],
        },
      },
      relatedPeopleIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Up to 4 person ids from the corpus.',
      },
      followUps: {
        type: 'array',
        items: { type: 'string' },
        description: 'Exactly 3 follow-up questions.',
      },
      noAnswer: {
        type: 'boolean',
        description:
          'True only when the corpus cannot support a confident answer.',
      },
    },
    required: ['answer', 'sources', 'followUps', 'noAnswer'],
  },
};

const seedDocIds = new Set(documents.map((d) => d.id));

function validPeopleIds(): Set<string> {
  return new Set(getPeople().map((p) => p.id));
}

function historyToMessages(history: ChatMessage[]): Anthropic.MessageParam[] {
  return history
    .filter((m) => !m.pending && m.content.trim().length > 0)
    .map((m) => ({
      role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.content,
    }));
}

export async function askNexus(
  question: string,
  history: ChatMessage[] = [],
  uploadedDocs: UploadedDoc[] = []
): Promise<NexusResult> {
  const useEdgeFunction = supabaseConfigured();
  if (!client && !useEdgeFunction) {
    return {
      answer:
        "Nexus isn't connected to a model yet. Add `VITE_ANTHROPIC_API_KEY` to `.env.local` and restart the dev server (or configure Supabase and deploy the `chat` Edge Function for a production setup).",
      sources: [],
      followUps: [],
      relatedPeopleIds: [],
      noAnswer: true,
    };
  }

  const messages: Anthropic.MessageParam[] = [
    ...historyToMessages(history),
    { role: 'user', content: question },
  ];

  const payload: Anthropic.MessageCreateParamsNonStreaming = {
    model: MODEL,
    max_tokens: 2000,
    system: buildSystemPrompt(uploadedDocs),
    tools: [ANSWER_TOOL],
    tool_choice: { type: 'tool', name: 'answer' },
    messages,
  };

  const response = useEdgeFunction
    ? await callViaEdgeFunction(payload)
    : await client!.messages.create(payload);

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
  );

  if (!toolUse) {
    throw new Error('Nexus did not return a structured answer.');
  }

  const raw = toolUse.input as {
    answer: string;
    confidence?: number;
    sources: Array<{ documentId: string; excerpt: string; relevanceReason: string }>;
    relatedPeopleIds?: string[];
    followUps?: string[];
    noAnswer?: boolean;
  };

  const uploadedDocIds = new Set(uploadedDocs.map((u) => u.id));
  const eventIds = new Set(eventsStore.get().map((e) => e.id));
  const publicationIds = new Set(publicationsStore.get().map((p) => p.id));
  // Filter to known ids so the UI never tries to render a phantom source.
  const sources = (raw.sources ?? []).filter(
    (s) =>
      seedDocIds.has(s.documentId) ||
      uploadedDocIds.has(s.documentId) ||
      eventIds.has(s.documentId) ||
      publicationIds.has(s.documentId)
  );
  const relatedPeopleIds = (raw.relatedPeopleIds ?? []).filter((id) =>
    validPeopleIds().has(id)
  );

  const confidence =
    typeof raw.confidence === 'number' && Number.isFinite(raw.confidence)
      ? clamp01(raw.confidence)
      : undefined;

  return {
    answer: raw.answer ?? '',
    confidence,
    sources,
    followUps: (raw.followUps ?? []).slice(0, 3),
    relatedPeopleIds,
    noAnswer: Boolean(raw.noAnswer),
  };
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

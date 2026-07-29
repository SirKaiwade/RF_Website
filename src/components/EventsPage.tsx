import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import {
  CalendarDays,
  MapPin,
  Users,
  ExternalLink,
  Video,
  Blend,
  MessageSquare,
  Link as LinkIcon,
  Megaphone,
  Newspaper,
  FileText,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import type { EventModality, EventType, IIGHEvent } from '../types';
import { EVENT_TYPES, EVENT_TYPE_DEFINITIONS, eventSortKey, eventsStore } from '../data/events';
import { eventDateLabel } from '../lib/corpusText';
import SpreadsheetImport from './SpreadsheetImport';
import EventEditor from './EventEditor';
import { useLocalDataInfo } from '../lib/localDataSync';
import { classNames, formatDate } from '../lib/format';
import type { ShellContext } from './AppShell';
import {
  CopyButton,
  EmptyState,
  PageHeader,
  SearchField,
  SegmentedControl,
} from './ui';

type TimeFilter = 'upcoming' | 'past' | 'all';

const TYPE_SHORT: Record<EventType, string> = {
  'Conference / Symposium': 'Conference',
  'Webinar / Seminar': 'Webinar',
  'Workshop / Capacity strengthening': 'Workshop',
  'Policy dialogue / High-level dialogue': 'Policy dialogue',
  'Consultation / Roundtable': 'Consultation',
  'Coordination / Partnership meeting': 'Partnership',
  'Side event': 'Side event',
  Other: 'Other',
};

const TYPE_CHIP: Record<EventType, string> = {
  'Conference / Symposium': 'chip-teal',
  'Webinar / Seminar': 'chip-blue',
  'Workshop / Capacity strengthening': 'chip-green',
  'Policy dialogue / High-level dialogue': 'chip-amber',
  'Consultation / Roundtable': 'chip-gray',
  'Coordination / Partnership meeting': 'chip-gray',
  'Side event': 'chip-red',
  Other: 'chip-gray',
};

function modalityIcon(modality: EventModality) {
  if (modality === 'Virtual') return Video;
  if (modality === 'Hybrid') return Blend;
  return MapPin;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isUpcoming(e: IIGHEvent): boolean {
  return e.date != null && e.date >= todayISO();
}

export default function EventsPage() {
  const ctx = useOutletContext<ShellContext>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const events = eventsStore.use();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming');
  const [wpFilter, setWpFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<IIGHEvent | null>(null);
  const dataInfo = useLocalDataInfo();

  // Deep link from citations: /events?open=<id>
  useEffect(() => {
    const open = searchParams.get('open');
    if (open) {
      setExpandedId(open);
      setTimeFilter('all');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const workPackages = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => e.workPackage && set.add(e.workPackage));
    return [...set].sort();
  }, [events]);

  const typeCounts = useMemo(() => {
    const counts = new Map<EventType | 'all', number>([['all', events.length]]);
    for (const t of EVENT_TYPES) counts.set(t, 0);
    for (const e of events) counts.set(e.type, (counts.get(e.type) ?? 0) + 1);
    return counts;
  }, [events]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = events
      .filter((e) => {
        if (typeFilter !== 'all' && e.type !== typeFilter) return false;
        if (wpFilter !== 'all' && e.workPackage !== wpFilter) return false;
        if (timeFilter === 'upcoming' && !isUpcoming(e)) return false;
        if (timeFilter === 'past' && (e.date == null || e.date >= todayISO())) return false;
        if (!q) return true;
        return [
          e.title,
          e.description,
          e.owner,
          e.partners,
          e.funder,
          e.location,
          e.workPackage,
          e.programme,
          e.keyOutputs,
        ]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q));
      })
      .sort((a, b) => {
        // Upcoming: soonest first. Past / all: newest first via eventSortKey.
        if (timeFilter === 'upcoming') {
          return (a.date ?? '9999').localeCompare(b.date ?? '9999') || a.title.localeCompare(b.title);
        }
        return eventSortKey(b).localeCompare(eventSortKey(a));
      });
    return list;
  }, [events, query, typeFilter, wpFilter, timeFilter]);

  const upcomingCount = useMemo(() => events.filter(isUpcoming).length, [events]);

  function askNexusAbout(e: IIGHEvent) {
    ctx.sendMessage(`What do we know about the event "${e.title}"?`);
    navigate('/');
  }

  function openAdd() {
    setEditing(null);
    setEditorOpen(true);
  }

  function openEdit(e: IIGHEvent) {
    setEditing(e);
    setEditorOpen(true);
  }

  function saveEvent(record: IIGHEvent) {
    if (editing) eventsStore.update(record);
    else eventsStore.add(record);
    setExpandedId(record.id);
  }

  function deleteEvent(e: IIGHEvent) {
    if (!window.confirm(`Delete "${e.title}"? This cannot be undone.`)) return;
    eventsStore.remove(e.id);
    if (expandedId === e.id) setExpandedId(null);
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <section
      className={classNames(
        'flex-1 min-w-0 flex flex-col bg-surface relative',
        ctx.openDocId ? 'border-r border-rule' : ''
      )}
    >
      <PageHeader
        icon={CalendarDays}
        title="Events"
        subtitle={`Programme events matrix · referencable from chat${dataInfo.label ? ` · ${dataInfo.label}` : ''}`}
        search={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search title, owner, location…"
            className="hidden sm:block"
          />
        }
        actions={
          <>
            <SpreadsheetImport kind="events" />
            <button
              type="button"
              onClick={openAdd}
              className="btn btn-primary btn-sm"
              title="Add an event"
            >
              <Plus className="w-3.5 h-3.5" />
              Add event
            </button>
          </>
        }
      />

      <div className="toolbar">
        <SegmentedControl
          value={timeFilter}
          onChange={setTimeFilter}
          ariaLabel="Time filter"
          options={[
            { value: 'upcoming', label: `Upcoming (${upcomingCount})` },
            { value: 'past', label: 'Past' },
            { value: 'all', label: 'All' },
          ]}
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as EventType | 'all')}
          className="select w-auto py-1.5 text-[12px]"
          aria-label="Filter by event type"
        >
          <option value="all">All types ({typeCounts.get('all')})</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_SHORT[t]} ({typeCounts.get(t) ?? 0})
            </option>
          ))}
        </select>

        {workPackages.length > 0 && (
          <select
            value={wpFilter}
            onChange={(e) => setWpFilter(e.target.value)}
            className="select w-auto max-w-[220px] py-1.5 text-[12px]"
            aria-label="Filter by work package"
          >
            <option value="all">All work packages</option>
            {workPackages.map((wp) => (
              <option key={wp} value={wp}>
                {wp}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1600px] mx-auto px-5 lg:px-8 py-6 lg:py-8">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search title, owner, location…"
            className="sm:hidden mb-4 max-w-none"
          />

          {events.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Build the events register"
              description="Import the events matrix or add events manually. Keep dates, owners, and reach here so Nexus can brief staff from the same source of truth."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={openAdd} className="btn btn-primary btn-sm">
                    <Plus className="w-3.5 h-3.5" />
                    Add an event
                  </button>
                  <SpreadsheetImport kind="events" />
                </div>
              }
            />
          ) : filtered.length === 0 ? (
            <div className="text-center text-[13px] text-gray-500 py-16 border border-dashed border-rule rounded-sm">
              {query.trim()
                ? `No events match "${query}" with these filters.`
                : timeFilter === 'upcoming'
                  ? 'No upcoming events. Switch to Past or All, or add the next one.'
                  : 'No events match these filters.'}
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-3 mb-3">
                <p className="text-[13px] text-gray-500">
                  <span className="font-semibold text-ink tabular-nums">{filtered.length}</span>
                  {' '}
                  {filtered.length === 1 ? 'event' : 'events'}
                  {timeFilter === 'upcoming'
                    ? ' upcoming'
                    : timeFilter === 'past'
                      ? ' past'
                      : ''}
                </p>
                <p className="text-[12px] text-gray-500 hidden md:block">
                  Expand a row for reach, partners, outputs, and links
                </p>
              </div>

              <div className="data-register">
                <div className="data-register-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="w-8" />
                        <th>Date</th>
                        <th>Event</th>
                        <th>Type</th>
                        <th>Where</th>
                        <th>Owner</th>
                        <th>Reach</th>
                        <th className="w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((event) => {
                        const open = expandedId === event.id;
                        return (
                          <EventRegisterRows
                            key={event.id}
                            event={event}
                            open={open}
                            onToggle={() => toggleExpand(event.id)}
                            onEdit={() => openEdit(event)}
                            onDelete={() => deleteEvent(event)}
                            onAskNexus={() => askNexusAbout(event)}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {editorOpen && (
        <EventEditor
          initial={editing ?? undefined}
          onClose={() => setEditorOpen(false)}
          onSave={saveEvent}
        />
      )}
    </section>
  );
}

function EventRegisterRows({
  event,
  open,
  onToggle,
  onEdit,
  onDelete,
  onAskNexus,
}: {
  event: IIGHEvent;
  open: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAskNexus: () => void;
}) {
  const ModalityIcon = modalityIcon(event.modality);
  const where =
    event.location ||
    (event.modality !== 'Unspecified' ? event.modality : null);

  return (
    <>
      <tr
        className={classNames('data-row', open && 'data-row-open')}
        onClick={onToggle}
      >
        <td className="text-gray-400 w-8">
          {open ? (
            <ChevronDown className="w-4 h-4" strokeWidth={1.75} />
          ) : (
            <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
          )}
        </td>
        <td>
          <div className="whitespace-nowrap">
            <div
              className={classNames(
                'font-medium tabular-nums',
                isUpcoming(event) ? 'text-un-blue-text' : 'text-ink'
              )}
            >
              {event.date ? formatDate(event.date) : 'TBC'}
            </div>
            {event.dateNote && !event.date && (
              <div className="text-[11px] text-gray-500 max-w-[120px] truncate" title={event.dateNote}>
                {event.dateNote}
              </div>
            )}
          </div>
        </td>
        <td>
          <div className="min-w-0 max-w-[320px]">
            <div className="font-semibold text-ink leading-snug line-clamp-2">{event.title}</div>
            {event.workPackage && (
              <div className="text-[11px] text-gray-500 mt-0.5 truncate">{event.workPackage}</div>
            )}
          </div>
        </td>
        <td>
          <span className={classNames('chip text-[10px] py-0.5 px-1.5', TYPE_CHIP[event.type])}>
            {TYPE_SHORT[event.type]}
          </span>
        </td>
        <td>
          {where ? (
            <span className="inline-flex items-start gap-1 text-[12px] text-gray-600 max-w-[160px]">
              <ModalityIcon className="w-3 h-3 mt-0.5 shrink-0" strokeWidth={1.75} />
              <span className="line-clamp-2">{where}</span>
            </span>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
        <td>
          <span className="text-[12px] text-gray-700 max-w-[140px] line-clamp-2">
            {event.owner || '—'}
          </span>
        </td>
        <td>
          {event.totalParticipants != null ? (
            <span className="inline-flex items-center gap-1 tabular-nums text-[12px] text-gray-600">
              <Users className="w-3 h-3" strokeWidth={1.75} />
              {event.totalParticipants.toLocaleString()}
            </span>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 rounded-sm text-gray-400 hover:text-un-blue hover:bg-un-blue-bg"
              title="Edit"
              aria-label={`Edit ${event.title}`}
            >
              <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-sm text-gray-400 hover:text-accent-red hover:bg-red-50"
              title="Delete"
              aria-label={`Delete ${event.title}`}
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </td>
      </tr>
      {open && (
        <tr className="data-detail">
          <td colSpan={8}>
            <EventDetailPanel
              event={event}
              onAskNexus={onAskNexus}
              onEdit={onEdit}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function EventDetailPanel({
  event,
  onAskNexus,
  onEdit,
}: {
  event: IIGHEvent;
  onAskNexus: () => void;
  onEdit: () => void;
}) {
  const reach: { label: string; value: string }[] = [];
  if (event.totalParticipants != null)
    reach.push({ label: 'Participants', value: event.totalParticipants.toLocaleString() });
  if (event.countriesRepresented)
    reach.push({ label: 'Countries', value: event.countriesRepresented });
  if (event.femalePct != null) reach.push({ label: 'Female', value: `${event.femalePct}%` });
  else if (event.femaleParticipants != null)
    reach.push({ label: 'Female', value: event.femaleParticipants.toLocaleString() });
  if (event.globalSouthPct != null)
    reach.push({ label: 'Global South', value: `${event.globalSouthPct}%` });
  else if (event.globalSouthParticipants != null)
    reach.push({ label: 'Global South', value: event.globalSouthParticipants.toLocaleString() });
  if (event.youthParticipants != null)
    reach.push({ label: 'Youth', value: event.youthParticipants.toLocaleString() });

  const links: { label: string; value: string; icon: typeof Newspaper }[] = [];
  if (event.websiteArticle)
    links.push({ label: 'Website article', value: event.websiteArticle, icon: Newspaper });
  if (event.mediaCoverage)
    links.push({ label: 'Media coverage', value: event.mediaCoverage, icon: Megaphone });
  if (event.socialMedia)
    links.push({ label: 'Social media', value: event.socialMedia, icon: LinkIcon });
  if (event.internalFileLink)
    links.push({ label: 'Internal files', value: event.internalFileLink, icon: FileText });

  return (
    <div className="data-detail-panel fade-in">
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {isUpcoming(event) && (
          <span className="chip chip-blue text-[10px] py-0.5 px-1.5">Upcoming</span>
        )}
        {event.level !== 'Unspecified' && (
          <span className="chip chip-gray text-[10px] py-0.5 px-1.5">{event.level}</span>
        )}
        <span className="text-[12px] text-gray-500">{eventDateLabel(event)}</span>
      </div>

      {event.description && (
        <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
          {event.description}
        </p>
      )}

      <div className="data-detail-grid">
        {event.owner && <Field label="Owner" value={event.owner} icon={UserIcon} />}
        {event.partners && <Field label="Partners / co-convenors" value={event.partners} />}
        {event.funder && <Field label="Funder / donor" value={event.funder} />}
        {event.programme && <Field label="Programme / flagship" value={event.programme} />}
        {event.workPackage && <Field label="Work package" value={event.workPackage} />}
        {event.strategicPurpose && (
          <Field label="Strategic purpose" value={event.strategicPurpose} />
        )}
        {event.modality !== 'Unspecified' && (
          <Field label="Modality" value={event.modality} />
        )}
        {event.location && <Field label="Location" value={event.location} icon={MapPin} />}
      </div>

      {reach.length > 0 && (
        <div className="mt-4">
          <div className="data-field-label mb-2">Reach</div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {reach.map((r) => (
              <div key={r.label}>
                <div className="text-[15px] font-semibold tabular-nums text-ink">{r.value}</div>
                <div className="text-[11px] text-gray-500">{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(event.southSouthExchange ||
        (event.crossWpCollaboration && /^y/i.test(event.crossWpCollaboration)) ||
        (event.highLevelParticipants && /^y/i.test(event.highLevelParticipants))) && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {event.southSouthExchange && (
            <span className="chip chip-green text-[10px]">South-South exchange</span>
          )}
          {event.crossWpCollaboration && /^y/i.test(event.crossWpCollaboration) && (
            <span className="chip chip-blue text-[10px]">Cross-WP collaboration</span>
          )}
          {event.highLevelParticipants && /^y/i.test(event.highLevelParticipants) && (
            <span className="chip chip-amber text-[10px]">High-level participants</span>
          )}
        </div>
      )}

      {event.keyOutputs && (
        <div className="mt-4">
          <div className="data-field-label">Key outputs</div>
          <p className="data-field-value whitespace-pre-wrap mt-1">{event.keyOutputs}</p>
        </div>
      )}

      {links.length > 0 && (
        <div className="mt-4">
          <div className="data-field-label mb-2">Coverage & links</div>
          <div className="space-y-2">
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <div key={l.label} className="flex items-start gap-2 text-[12px]">
                  <Icon className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" strokeWidth={1.75} />
                  <div className="min-w-0">
                    <div className="text-[11px] text-gray-500 font-medium">{l.label}</div>
                    <LinkOrText value={l.value} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="mt-4 text-[11px] text-gray-500 leading-relaxed max-w-3xl">
        {EVENT_TYPE_DEFINITIONS[event.type]}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={onAskNexus} className="btn btn-secondary btn-sm">
          <MessageSquare className="w-3.5 h-3.5" />
          Ask Nexus
        </button>
        <button type="button" onClick={onEdit} className="btn btn-ghost btn-sm">
          <Pencil className="w-3.5 h-3.5" />
          Edit record
        </button>
        {event.title && (
          <span className="inline-flex items-center">
            <CopyButton value={event.title} label="Copy title" />
            <span className="text-[11px] text-gray-500 ml-1">Copy title</span>
          </span>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  children,
  icon: Icon,
}: {
  label: string;
  value?: string;
  children?: ReactNode;
  icon?: typeof MapPin;
}) {
  return (
    <div>
      <div className="data-field-label flex items-center gap-1.5">
        {Icon ? <Icon className="w-3 h-3" strokeWidth={1.75} /> : null}
        {label}
      </div>
      <div className="data-field-value whitespace-pre-wrap">{children ?? value ?? '—'}</div>
    </div>
  );
}

function LinkOrText({ value }: { value: string }) {
  if (/^https?:\/\//i.test(value.trim())) {
    const url = value.trim().split(/\s+/)[0];
    return (
      <span className="copyable">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-un-blue hover:underline break-all inline-flex items-start gap-1"
        >
          {url}
          <ExternalLink className="w-3 h-3 shrink-0 mt-0.5" strokeWidth={1.75} />
        </a>
        <CopyButton value={url} label="Copy link" />
      </span>
    );
  }
  return <span className="whitespace-pre-wrap text-ink">{value}</span>;
}

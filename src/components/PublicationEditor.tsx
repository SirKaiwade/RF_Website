import { useState } from 'react';
import type { Publication } from '../types';
import { PUBLICATION_TYPES } from '../data/publications';
import { makeRecordId } from '../lib/recordId';
import { emptyPublication } from '../lib/recordTemplates';
import RecordFormModal, {
  FormField,
  nullIfEmpty,
  selectInput,
  textArea,
  textInput,
} from './RecordFormModal';

interface Props {
  initial?: Publication;
  onClose: () => void;
  onSave: (record: Publication) => void;
}

export default function PublicationEditor({ initial, onClose, onSave }: Props) {
  const isNew = !initial;
  const [draft, setDraft] = useState<Publication>(initial ?? emptyPublication());

  function set<K extends keyof Publication>(key: K, value: Publication[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleSave() {
    const title = draft.title.trim();
    if (!title) return;
    const id =
      draft.id ||
      makeRecordId('pub', title.toLowerCase());
    onSave({
      ...draft,
      id,
      title,
      date: nullIfEmpty(draft.date ?? ''),
      firstAuthor: nullIfEmpty(draft.firstAuthor ?? ''),
      otherAuthors: nullIfEmpty(draft.otherAuthors ?? ''),
      type: nullIfEmpty(draft.type ?? ''),
      outlet: nullIfEmpty(draft.outlet ?? ''),
      link: nullIfEmpty(draft.link ?? ''),
      workPackage: nullIfEmpty(draft.workPackage ?? ''),
      targetAudience: nullIfEmpty(draft.targetAudience ?? ''),
      purpose: nullIfEmpty(draft.purpose ?? ''),
    });
    onClose();
  }

  const types = PUBLICATION_TYPES;

  return (
    <RecordFormModal
      title={isNew ? 'Add publication' : 'Edit publication'}
      submitLabel={isNew ? 'Add' : 'Save'}
      onClose={onClose}
      onSubmit={handleSave}
      wide
    >
      <FormField label="Title" required>
        <input
          className={textInput()}
          value={draft.title}
          onChange={(e) => set('title', e.target.value)}
          required
        />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Date">
          <input
            type="date"
            className={textInput()}
            value={draft.date ?? ''}
            onChange={(e) => set('date', e.target.value || null)}
          />
        </FormField>
        <FormField label="Type">
          <select
            className={selectInput()}
            value={draft.type ?? ''}
            onChange={(e) => set('type', e.target.value || null)}
          >
            <option value="">—</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="First author">
          <input
            className={textInput()}
            value={draft.firstAuthor ?? ''}
            onChange={(e) => set('firstAuthor', e.target.value)}
          />
        </FormField>
        <FormField label="Other authors">
          <input
            className={textInput()}
            value={draft.otherAuthors ?? ''}
            onChange={(e) => set('otherAuthors', e.target.value)}
          />
        </FormField>
      </div>
      <FormField label="Outlet / publisher">
        <input
          className={textInput()}
          value={draft.outlet ?? ''}
          onChange={(e) => set('outlet', e.target.value)}
        />
      </FormField>
      <FormField label="Link / DOI">
        <input
          type="url"
          className={textInput()}
          value={draft.link ?? ''}
          onChange={(e) => set('link', e.target.value)}
          placeholder="https://"
        />
      </FormField>
      <FormField label="Work package">
        <input
          className={textInput()}
          value={draft.workPackage ?? ''}
          onChange={(e) => set('workPackage', e.target.value)}
        />
      </FormField>
      <FormField label="Target audience">
        <input
          className={textInput()}
          value={draft.targetAudience ?? ''}
          onChange={(e) => set('targetAudience', e.target.value)}
        />
      </FormField>
      <FormField label="Purpose">
        <textarea
          className={textArea()}
          value={draft.purpose ?? ''}
          onChange={(e) => set('purpose', e.target.value)}
        />
      </FormField>
    </RecordFormModal>
  );
}

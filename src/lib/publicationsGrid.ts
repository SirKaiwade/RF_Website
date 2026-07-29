import type { Publication } from '../types';
import { makeRecordId } from './recordId';

export function emptyPublicationRow(): Publication {
  return {
    id: makeRecordId('pub', `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
    title: '',
    date: null,
    firstAuthor: null,
    otherAuthors: null,
    type: null,
    outlet: null,
    link: null,
    workPackage: null,
    targetAudience: null,
    globalSouth: null,
    purpose: null,
  };
}

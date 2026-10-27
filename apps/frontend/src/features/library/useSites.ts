import type { Site, SitesQuery } from '@entrelinhas/contracts';
import { api } from '../../api';
import { usePagedList, type FetchPage } from '../shared/usePagedList';

export const PAGE_SIZE = 6;

type Query = Omit<SitesQuery, 'cursor' | 'limit'>;

// Later pages only send the cursor: the server keeps the snapshot of the first page's filters.
const fetchSites: FetchPage<Query, Site> = (query, cursor, signal) =>
  api.listSites(cursor ? { cursor, limit: PAGE_SIZE } : { ...query, limit: PAGE_SIZE }, { signal });

export function useSites(query: Query) {
  return usePagedList(query, fetchSites);
}

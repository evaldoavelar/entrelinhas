import { z } from 'zod';
import { ProcessingState, Visibility } from './enums';

// HTTP contract v1 (plano §8, extensão §4). Objects are strict: unknown fields are rejected so
// clients cannot smuggle profile/role/provider fields (CA99). Identity is always server-derived.

export const Id = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/, 'id opaco inválido');
export const DateTime = z.iso.datetime({ offset: true });

export const ApiErrorBody = z.strictObject({
  error: z.strictObject({
    code: z.string().regex(/^[a-z_]{1,64}$/),
    message: z.string().max(500),
    retry_after_seconds: z.int().nonnegative().optional(),
  }),
});
export type ApiErrorBody = z.infer<typeof ApiErrorBody>;

export function pageOf<T extends z.ZodType>(item: T) {
  return z.strictObject({
    items: z.array(item),
    // Opaque cursor bound to a server snapshot (filter/order/profile/visibility), CA22.
    next_cursor: z.string().max(512).nullable(),
    total: z.int().nonnegative(),
  });
}

// Preferences and session

export const THEMES = ['dark', 'light'] as const;
export const LIBRARY_VIEWS = ['cards', 'compact', 'list'] as const;
export const Theme = z.enum(THEMES);
export const LibraryView = z.enum(LIBRARY_VIEWS);
export type Theme = z.infer<typeof Theme>;
export type LibraryView = z.infer<typeof LibraryView>;

export const Preferences = z.strictObject({ theme: Theme, library_view: LibraryView });
export const PreferencesUpdate = Preferences.partial();
export type Preferences = z.infer<typeof Preferences>;
export type PreferencesUpdate = z.infer<typeof PreferencesUpdate>;

export const ProfilePublic = z.strictObject({
  id: Id,
  display_name: z.string().min(1).max(80),
  initials: z.string().min(1).max(3),
  // Whether the profile has PIN/passkey for private captures (ADR-06). Not an authorization.
  has_pin: z.boolean(),
});
export type ProfilePublic = z.infer<typeof ProfilePublic>;

export const SessionCreateRequest = z.strictObject({
  household_password: z.string().min(1).max(256),
  profile_id: Id,
});
export type SessionCreateRequest = z.infer<typeof SessionCreateRequest>;

export const Session = z.strictObject({
  profile: ProfilePublic,
  preferences: Preferences,
  unread_notifications: z.int().nonnegative(),
  // Unlock of private captures is per session and separate from household login (ADR-06).
  private_unlocked: z.boolean(),
});
export type Session = z.infer<typeof Session>;

export const AdminSessionCreateRequest = z.strictObject({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(256),
  totp_code: z.string().regex(/^\d{6}$/),
});
export type AdminSessionCreateRequest = z.infer<typeof AdminSessionCreateRequest>;

export const AdminSession = z.strictObject({
  admin: z.strictObject({ id: Id, username: z.string().max(64), display_name: z.string().max(80) }),
  idle_expires_at: DateTime,
});
export type AdminSession = z.infer<typeof AdminSession>;

// Library

export const Category = z.strictObject({ id: Id, name: z.string().min(1).max(60), site_count: z.int().nonnegative() });
export type Category = z.infer<typeof Category>;

export const MONITORING_STATES = ['active', 'paused', 'none'] as const;

export const Site = z.strictObject({
  id: Id,
  name: z.string().min(1).max(120),
  domain: z.string().min(1).max(253),
  icon_url: z.string().max(2048).nullable(),
  category_id: Id.nullable(),
  category_name: z.string().max(60).nullable(),
  audio_count: z.int().nonnegative(),
  unheard_count: z.int().nonnegative(),
  // Only successful conversions update this (RF06); null when none yet.
  last_conversion_at: DateTime.nullable(),
  monitoring: z.enum(MONITORING_STATES),
});
export type Site = z.infer<typeof Site>;

export const SITE_SORTS = ['last_conversion', 'name'] as const;
export const SORT_ORDERS = ['asc', 'desc'] as const;
export type SiteSort = (typeof SITE_SORTS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];

export const SitesQuery = z.strictObject({
  q: z.string().trim().min(1).max(2000).optional(),
  category: Id.optional(),
  sort: z.enum(SITE_SORTS).default('last_conversion'),
  order: z.enum(SORT_ORDERS).default('desc'),
  cursor: z.string().max(512).optional(),
  limit: z.int().min(1).max(50).default(20),
});
export type SitesQuery = z.input<typeof SitesQuery>;

export const LISTEN_STATES = ['unheard', 'in_progress', 'heard'] as const;

export const Post = z.strictObject({
  id: Id,
  site_id: Id,
  site_name: z.string().max(120),
  title: z.string().min(1).max(500),
  published_at: DateTime.nullable(),
  duration_seconds: z.int().nonnegative().nullable(),
  tags: z.array(z.string().max(60)).max(30),
  listen_state: z.enum(LISTEN_STATES),
  processing_state: ProcessingState,
  visibility: Visibility,
});
export type Post = z.infer<typeof Post>;

export const ContinueListening = z.strictObject({ post: Post, position_seconds: z.int().nonnegative() }).nullable();
export type ContinueListening = z.infer<typeof ContinueListening>;

// Search: highlighted snippets are plain text segments rendered as text, never HTML (CA67).

export const SearchQuery = z.strictObject({
  q: z.string().trim().min(1).max(2000),
  cursor: z.string().max(512).optional(),
  limit: z.int().min(1).max(50).default(20),
});
export type SearchQuery = z.input<typeof SearchQuery>;

export const SnippetSegment = z.strictObject({ text: z.string().max(400), highlight: z.boolean() });
export const SearchResult = z.strictObject({
  post: Post,
  match: z.strictObject({
    field: z.enum(['title', 'summary', 'body', 'tags']),
    snippet: z.array(SnippetSegment).max(20),
  }),
});
export type SearchResult = z.infer<typeof SearchResult>;

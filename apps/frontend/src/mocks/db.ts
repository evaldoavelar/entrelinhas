import type { Preferences } from '@entrelinhas/contracts';

// Mutable mock state. Deterministic per scenario and reset before every test (resetDb).
interface MockState {
  sessionProfileId: string | null;
  privateUnlocked: boolean;
  preferences: Record<string, Preferences>;
  unreadNotifications: number;
}

const initial = (): MockState => ({
  sessionProfileId: null,
  privateUnlocked: false,
  preferences: {},
  unreadNotifications: 2,
});

export const db: MockState = initial();

export function resetDb() {
  Object.assign(db, initial());
}

export function preferencesOf(profileId: string): Preferences {
  return db.preferences[profileId] ?? { theme: 'dark', library_view: 'cards' };
}

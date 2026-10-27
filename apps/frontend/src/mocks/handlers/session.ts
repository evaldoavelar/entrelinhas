import { http } from 'msw';
import {
  AdminSession,
  AdminSessionCreateRequest,
  Preferences,
  PreferencesUpdate,
  ProfileList,
  Session,
  SessionCreateRequest,
} from '@entrelinhas/contracts';
import { HttpResponse } from 'msw';
import { db, preferencesOf } from '../db';
import { HOUSEHOLD_PASSWORD, MOCK_NOW, profiles } from '../fixtures';
import { ok, readBody } from '../respond';
import { errorResponse, scenarioOverride } from '../scenario';

// SIMULATED authentication: no real secrets or isolation (ADR-12). Mirrors the contract only.

function currentSession() {
  const profile = profiles.find((p) => p.id === db.sessionProfileId);
  if (!profile) return undefined;
  return {
    profile,
    preferences: preferencesOf(profile.id),
    unread_notifications: db.unreadNotifications,
    private_unlocked: db.privateUnlocked,
  };
}

export const unauthenticated = () => errorResponse(401, 'unauthenticated', 'Entre com a senha da casa.');

export const sessionHandlers = [
  http.get('/v1/session', async () => {
    const override = await scenarioOverride();
    if (override) return override;
    const session = currentSession();
    return session ? ok(Session, session) : unauthenticated();
  }),

  http.post('/v1/session', async ({ request }) => {
    const override = await scenarioOverride();
    if (override) return override;
    const body = await readBody(request, SessionCreateRequest);
    if (body instanceof Response) return body;
    const profile = profiles.find((p) => p.id === body.profile_id);
    if (body.household_password !== HOUSEHOLD_PASSWORD || !profile) {
      return errorResponse(401, 'invalid_credentials', 'Senha da casa incorreta.');
    }
    db.sessionProfileId = profile.id;
    db.privateUnlocked = false;
    return ok(Session, currentSession() as Session, 201);
  }),

  http.delete('/v1/session', () => {
    db.sessionProfileId = null;
    db.privateUnlocked = false;
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/v1/profiles/public', async () => (await scenarioOverride()) ?? ok(ProfileList, { items: profiles })),

  http.patch('/v1/me/preferences', async ({ request }) => {
    const override = await scenarioOverride();
    if (override) return override;
    if (!db.sessionProfileId) return unauthenticated();
    const body = await readBody(request, PreferencesUpdate);
    if (body instanceof Response) return body;
    const changes = Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined));
    const next = Preferences.parse({ ...preferencesOf(db.sessionProfileId), ...changes });
    db.preferences[db.sessionProfileId] = next;
    return ok(Preferences, next);
  }),

  http.post('/v1/admin/session', async ({ request }) => {
    const override = await scenarioOverride();
    if (override) return override;
    const body = await readBody(request, AdminSessionCreateRequest);
    if (body instanceof Response) return body;
    if (body.username !== 'evaldo' || body.password !== 'admin-exemplo' || body.totp_code !== '482913') {
      return errorResponse(401, 'invalid_credentials', 'Usuário, senha ou código incorretos.');
    }
    const expires = new Date(Date.parse(MOCK_NOW) + 15 * 60_000).toISOString();
    return ok(AdminSession, { admin: { id: 'adm_evaldo', username: 'evaldo', display_name: 'Evaldo Avelar' }, idle_expires_at: expires }, 201);
  }),
];

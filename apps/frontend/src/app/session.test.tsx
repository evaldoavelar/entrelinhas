import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { http, HttpResponse } from 'msw';
import { SessionProvider, useSession } from './session';
import { server } from '../mocks/server';
import { profiles } from '../mocks/fixtures';

const wrapper = ({ children }: { children: ReactNode }) => <SessionProvider>{children}</SessionProvider>;

test('useSession outside the provider fails loudly', () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  expect(() => renderHook(() => useSession())).toThrow('useSession fora de SessionProvider');
});

test('signedIn stores a session obtained by the login flow', async () => {
  const { result } = renderHook(() => useSession(), { wrapper });
  await waitFor(() => expect(result.current.state.status).toBe('anonymous'));
  const session = {
    profile: profiles[1]!,
    preferences: { theme: 'light', library_view: 'list' },
    unread_notifications: 0,
    private_unlocked: false,
  } as const;
  act(() => result.current.signedIn(session));
  expect(result.current.state).toEqual({ status: 'authenticated', session });
  expect(document.documentElement.dataset.theme).toBe('light');
});

test('preference update without a session keeps the anonymous state', async () => {
  const { result } = renderHook(() => useSession(), { wrapper });
  await waitFor(() => expect(result.current.state.status).toBe('anonymous'));
  server.use(http.patch('/v1/me/preferences', () => HttpResponse.json({ theme: 'dark', library_view: 'cards' })));
  await act(() => result.current.updatePreferences({ theme: 'dark' }));
  expect(result.current.state.status).toBe('anonymous');
});

test('unmounting during the session load aborts without updating state', async () => {
  let release: () => void = () => undefined;
  server.use(http.get('/v1/session', () => new Promise<Response>((resolve) => (release = () => resolve(HttpResponse.json({}))))));
  const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const { unmount } = render(<SessionProvider>conteúdo</SessionProvider>);
  expect(screen.getByText('conteúdo')).toBeInTheDocument();
  unmount();
  release();
  await new Promise((r) => setTimeout(r, 20));
  expect(errors).not.toHaveBeenCalled();
});

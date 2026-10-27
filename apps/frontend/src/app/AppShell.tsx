import { useEffect, useId, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { Avatar, Badge, Button, Icon, IconButton, Toggle, type IconName } from '../components';
import type { Session } from '@entrelinhas/contracts';
import { useSession } from './session';

const MAIN_NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/library', label: 'Biblioteca', icon: 'home' },
  { to: '/playlists', label: 'Playlists', icon: 'list' },
  { to: '/sources', label: 'Fontes', icon: 'rss' },
  { to: '/notifications', label: 'Notificações', icon: 'bell' },
  { to: '/private', label: 'Capturas privadas', icon: 'lock' },
];

function NavItems({ unread, onNavigate }: { unread: number; onNavigate?: () => void }) {
  return (
    <ul>
      {MAIN_NAV.map((item) => (
        <li key={item.to}>
          <NavLink to={item.to} className="shell__nav-link" onClick={onNavigate}>
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.to === '/notifications' ? (
              <>
                {' '}
                <Badge count={unread} label="notificações não lidas" />
              </>
            ) : null}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function ProfileControls({ session }: { session: Session }) {
  const { signOut, updatePreferences } = useSession();
  const { profile, preferences } = session;
  return (
    <div className="shell__profile">
      <p className="shell__profile-name">
        <Avatar initials={profile.initials} />
        <span>{profile.display_name}</span>
      </p>
      <Toggle
        label="Tema escuro (Dracula)"
        checked={preferences.theme === 'dark'}
        onChange={(dark) => void updatePreferences({ theme: dark ? 'dark' : 'light' })}
      />
      <Button variant="ghost" onClick={() => void signOut()}>
        <Icon name="logout" />
        Sair
      </Button>
    </div>
  );
}

// Shell from frame 01 (desktop sidebar) and frame 16 (mobile header + tab bar). On mobile the
// header button opens a disclosure with every destination, theme and sign out. Player: TASK-021.
export function AppShell() {
  const { state } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuButton = useRef<HTMLButtonElement>(null);
  const main = useRef<HTMLElement>(null);
  // Bumped on every choice in the mobile menu, including the current page (pathname unchanged).
  const [mainFocusRequest, setMainFocusRequest] = useState(0);

  // After choosing a destination in the mobile menu the focused link unmounts; move focus to the page.
  useEffect(() => {
    if (mainFocusRequest > 0) main.current?.focus();
  }, [mainFocusRequest]);

  // Escape closes the menu wherever focus is (button or panel) and returns focus to the button.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMenuOpen(false);
      menuButton.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  if (state.status !== 'authenticated') return null;
  const unread = state.session.unread_notifications;

  return (
    <div className="shell">
      <aside className="shell__sidebar">
        <p className="shell__brand">
          <Icon name="headphones" size={28} />
          <span>entrelinhas</span>
        </p>
        <p className="shell__tagline">Leituras para ouvir</p>
        <nav aria-label="Principal" className="shell__nav">
          <NavItems unread={unread} />
        </nav>
        <ProfileControls session={state.session} />
      </aside>

      <header className="shell__mobile-header">
        <p className="shell__brand">
          <Icon name="headphones" size={24} />
          <span>entrelinhas</span>
        </p>
        <IconButton
          ref={menuButton}
          icon="settings"
          label="Menu"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((open) => !open)}
        />
      </header>
      {menuOpen ? (
        <nav id={menuId} aria-label="Menu do perfil" className="shell__mobile-menu">
          <NavItems
            unread={unread}
            onNavigate={() => {
              setMainFocusRequest((n) => n + 1);
              setMenuOpen(false);
            }}
          />
          <ProfileControls session={state.session} />
        </nav>
      ) : null}

      <main ref={main} tabIndex={-1} className="shell__main">
        <Outlet />
      </main>
      <nav aria-label="Atalhos" className="shell__tabbar">
        {MAIN_NAV.slice(0, 3).map((item) => (
          <NavLink key={item.to} to={item.to} className="shell__tab">
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

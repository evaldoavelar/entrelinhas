import { NavLink, Outlet } from 'react-router';
import { Avatar, Badge, Button, Icon, Toggle, type IconName } from '../components';
import { useSession } from './session';

const MAIN_NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/library', label: 'Biblioteca', icon: 'home' },
  { to: '/playlists', label: 'Playlists', icon: 'list' },
  { to: '/sources', label: 'Fontes', icon: 'rss' },
  { to: '/notifications', label: 'Notificações', icon: 'bell' },
  { to: '/private', label: 'Capturas privadas', icon: 'lock' },
];

// Shell from frame 01 (desktop sidebar) and frame 16 (mobile tab bar). The player bar arrives with TASK-021.
export function AppShell() {
  const { state, signOut, updatePreferences } = useSession();
  if (state.status !== 'authenticated') return null;
  const { profile, preferences, unread_notifications } = state.session;

  return (
    <div className="shell">
      <aside className="shell__sidebar">
        <p className="shell__brand">
          <Icon name="headphones" size={28} />
          <span>entrelinhas</span>
        </p>
        <p className="shell__tagline">Leituras para ouvir</p>
        <nav aria-label="Principal" className="shell__nav">
          <ul>
            {MAIN_NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className="shell__nav-link">
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {item.to === '/notifications' ? <>{' '}<Badge count={unread_notifications} label="notificações não lidas" /></> : null}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
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
      </aside>
      <main className="shell__main">
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

import { Navigate, type RouteObject } from 'react-router';
import { AdminLoginPage } from '../features/auth/admin/AdminLoginPage';
import { LoginPage } from '../features/auth/LoginPage';
import { AppShell } from './AppShell';
import { PendingPage } from './PendingPage';
import { RequireSession } from './RequireSession';
import { LibraryPage } from '../features/library/LibraryPage';
import { SearchPage } from '../features/search/SearchPage';

// Global router (leader-owned). Feature tasks replace PendingPage elements on integration.
export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/admin/login', element: <AdminLoginPage /> },
  // Admin area placeholder: no admin data and no admin session guard yet (SPRINT-06 adds both).
  { path: '/admin', element: <PendingPage eyebrow="Administração" title="Administração" sprint="SPRINT-06" /> },
  {
    element: <RequireSession />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/library" replace /> },
          { path: 'library', element: <LibraryPage /> },
          { path: 'search', element: <SearchPage /> },
          { path: 'sites/:siteId', element: <PendingPage eyebrow="Biblioteca" title="Detalhes da fonte" sprint="TASK-014" /> },
          { path: 'articles/:postId', element: <PendingPage eyebrow="Biblioteca" title="Player de áudio" sprint="TASK-021" /> },
          { path: 'imports/new', element: <PendingPage eyebrow="Biblioteca" title="Adicionar uma leitura" sprint="TASK-020" /> },
          { path: 'playlists', element: <PendingPage eyebrow="Playlists" title="Playlists" sprint="SPRINT-04" /> },
          { path: 'sources', element: <PendingPage eyebrow="Fontes" title="Fontes monitoradas" sprint="SPRINT-04" /> },
          { path: 'notifications', element: <PendingPage eyebrow="Notificações" title="Notificações" sprint="SPRINT-05" /> },
          { path: 'private', element: <PendingPage eyebrow="Capturas privadas" title="Suas capturas privadas" sprint="SPRINT-05" /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
];

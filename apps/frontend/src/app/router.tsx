import { Navigate, type RouteObject } from 'react-router';
import { AdminLoginPage } from '../features/auth/admin/AdminLoginPage';
import { LoginPage } from '../features/auth/LoginPage';
import { AppShell } from './AppShell';
import { PendingPage } from './PendingPage';
import { RequireSession } from './RequireSession';

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
          { path: 'library', element: <PendingPage eyebrow="Biblioteca" title="Sua biblioteca" sprint="TASK-012" /> },
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

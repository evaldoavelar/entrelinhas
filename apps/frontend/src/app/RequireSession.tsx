import { Navigate, Outlet, useLocation } from 'react-router';
import { Button } from '../components';
import { useSession } from './session';

export function RequireSession() {
  const { state, reload } = useSession();
  const location = useLocation();

  if (state.status === 'loading') {
    return (
      <p role="status" className="app-status">
        Carregando…
      </p>
    );
  }
  if (state.status === 'error') {
    return (
      <div className="app-status">
        <p role="alert">{state.error.message}</p>
        <Button onClick={reload}>Tentar de novo</Button>
      </div>
    );
  }
  if (state.status === 'anonymous') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { routes } from './app/router';
import { SessionProvider } from './app/session';

export function App() {
  const [router] = useState(() => createBrowserRouter(routes));
  return (
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  );
}

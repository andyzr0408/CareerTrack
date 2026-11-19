import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardProfesional from './pages/DashboardProfesional';
import DashboardCompania from './pages/DashboardCompania';
import BackofficeAdmin from './pages/BackofficeAdmin';
import { HOME_BY_ROLE, ROUTES } from './routes';

function Loading() {
  return (
    <p role="status" className="flex min-h-screen items-center justify-center text-sm text-muted">
      Cargando…
    </p>
  );
}

/** Solo deja pasar al rol indicado; si no hay sesión, vuelve al inicio de sesión. */
function RequireRole({ role, children }) {
  const { state } = useApp();
  const { session, booting } = state;
  if (booting) return <Loading />;
  if (!session) return <Navigate to={ROUTES.login} replace />;
  if (session.role !== role) return <Navigate to={HOME_BY_ROLE[session.role]} replace />;
  return children;
}

/** Quien ya inició sesión no necesita ver el acceso otra vez. */
function GuestOnly({ children }) {
  const { state } = useApp();
  const { session, booting } = state;
  if (booting) return <Loading />;
  return session ? <Navigate to={HOME_BY_ROLE[session.role]} replace /> : children;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.login} element={<GuestOnly><Login /></GuestOnly>} />
          <Route path={ROUTES.register} element={<GuestOnly><Register /></GuestOnly>} />
          <Route path={ROUTES.professional} element={<RequireRole role="professional"><DashboardProfesional /></RequireRole>} />
          <Route path={ROUTES.company} element={<RequireRole role="company"><DashboardCompania /></RequireRole>} />
          <Route path={ROUTES.admin} element={<RequireRole role="admin"><BackofficeAdmin /></RequireRole>} />
          <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

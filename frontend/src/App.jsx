import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardProfesional from './pages/DashboardProfesional';
import DashboardCompania from './pages/DashboardCompania';
import BackofficeAdmin from './pages/BackofficeAdmin';

const HOME = { professional: '/dashboard', company: '/empresa', admin: '/admin' };

/** Solo deja pasar al rol indicado; si no hay sesión, vuelve al inicio de sesión. */
function RequireRole({ role, children }) {
  const { state } = useApp();
  const { session } = state;
  if (!session) return <Navigate to="/" replace />;
  if (session.role !== role) return <Navigate to={HOME[session.role]} replace />;
  return children;
}

/** Quien ya inició sesión no necesita ver el acceso otra vez. */
function GuestOnly({ children }) {
  const { state } = useApp();
  const { session } = state;
  return session ? <Navigate to={HOME[session.role]} replace /> : children;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/registro" element={<GuestOnly><Register /></GuestOnly>} />
          <Route path="/dashboard" element={<RequireRole role="professional"><DashboardProfesional /></RequireRole>} />
          <Route path="/empresa" element={<RequireRole role="company"><DashboardCompania /></RequireRole>} />
          <Route path="/admin" element={<RequireRole role="admin"><BackofficeAdmin /></RequireRole>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

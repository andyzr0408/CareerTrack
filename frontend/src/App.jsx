import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import DashboardProfesional from './DashboardProfesional';
import DashboardCompania from './DashboardCompania';
import BackofficeAdmin from './BackofficeAdmin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<DashboardProfesional />} />
        <Route path="/empresa" element={<DashboardCompania />} />
        <Route path="/admin" element={<BackofficeAdmin />} /> {}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
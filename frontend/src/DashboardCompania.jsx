import React from 'react';

export default function DashboardCompania() {
  const vacantesActivas = [
    {
      id: 1,
      cargo: "Senior Backend Engineer (Go/Kubernetes)",
      modalidad: "Remoto",
      candidatos: 24,
      nuevos: 5,
      estado: "Activa",
      fecha: "Hace 2 días"
    },
    {
      id: 2,
      cargo: "Product Lead & Growth Strategist",
      modalidad: "Híbrido - Bogotá",
      candidatos: 8,
      nuevos: 0,
      estado: "En Pausa",
      fecha: "Hace 1 semana"
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      
      {}
      <nav className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 text-white font-bold px-2 py-1 rounded text-sm">CT</div>
          <span className="font-bold text-xl tracking-wide">CareerTrack <span className="font-normal text-slate-400 text-sm ml-2">| Corporativo</span></span>
        </div>
        <div className="flex gap-6 items-center">
            <span className="text-sm font-semibold text-white border-b-2 border-blue-500 pb-1 cursor-pointer">Mis Vacantes</span>
            <span className="text-sm font-medium text-slate-300 hover:text-white cursor-pointer">Candidatos</span>
            <span className="text-sm font-medium text-slate-300 hover:text-white cursor-pointer">Facturación</span>
            <div className="h-9 w-9 bg-blue-600 rounded-full flex items-center justify-center font-bold ml-4 border-2 border-slate-700 cursor-pointer">
              TV
            </div>
        </div>
      </nav>

      {}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">TechVentures Inc.</h1>
            <p className="text-gray-500 mt-1 font-medium">Gestiona tu ecosistema de talento y auditoría de postulaciones.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white border border-gray-300 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm shadow-sm">
              📄 Exportar PDF
            </button>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm shadow-sm">
              + Publicar Vacante
            </button>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-bold text-gray-500 uppercase">Vacantes Activas</p>
            <h3 className="text-3xl font-black text-slate-800 mt-2">12</h3>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-bold text-gray-500 uppercase">Total Candidatos</p>
            <h3 className="text-3xl font-black text-blue-600 mt-2">148</h3>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-bold text-gray-500 uppercase">Tasa de Contratación</p>
            <h3 className="text-3xl font-black text-emerald-600 mt-2">14%</h3>
          </div>
        </div>
        
        {}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-slate-800">Ofertas de Empleo Publicadas</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {vacantesActivas.map(vacante => (
              <div key={vacante.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div className="w-1/2">
                  <h4 className="text-lg font-bold text-slate-900">{vacante.cargo}</h4>
                  <p className="text-sm text-gray-500 mt-1">{vacante.modalidad} • Publicado {vacante.fecha}</p>
                </div>
                
                <div className="w-1/4 text-center">
                  <span className="text-2xl font-bold text-slate-800">{vacante.candidatos}</span>
                  <p className="text-xs text-gray-500 font-medium">Postulaciones</p>
                  {vacante.nuevos > 0 && (
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1 inline-block">+{vacante.nuevos} nuevos</span>
                  )}
                </div>
                
                <div className="w-1/4 flex flex-col items-end gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${vacante.estado === 'Activa' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {vacante.estado}
                  </span>
                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">Gestionar candidatos →</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
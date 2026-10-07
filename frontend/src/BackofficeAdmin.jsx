import React from 'react';

export default function BackofficeAdmin() {
  const auditoriaOfertas = [
    { id: '#VAC-8921', empresa: 'Fintech Global Inc.', cargo: 'Staff Backend Engineer', fecha: '18 Oct 2026', estado: 'Aprobada' },
    { id: '#VAC-8919', empresa: 'CloudScale AI', cargo: 'Lead AI Architect', fecha: '18 Oct 2026', estado: 'En Revisión' },
    { id: '#VAC-8962', empresa: 'Global Crypto', cargo: 'Digitador Remoto', fecha: '17 Oct 2026', estado: 'Bloqueada' },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
      
      {}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-red-600 text-white font-bold px-2 py-1 rounded text-xs">CT</div>
            <span className="font-bold text-lg tracking-wide">CareerTrack</span>
          </div>
          <span className="text-xs font-bold text-red-500 tracking-widest uppercase">Superadmin</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <span className="flex items-center gap-3 bg-blue-600/20 text-blue-400 px-4 py-3 rounded-lg font-medium border border-blue-500/30 cursor-pointer">
            Auditoría de Vacantes
          </span>
          <span className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors font-medium cursor-pointer">
            Empresas & Compañías
          </span>
          <span className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors font-medium cursor-pointer">
            Profesionales
          </span>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-700 rounded-full flex items-center justify-center font-bold">AD</div>
            <div>
              <p className="text-sm font-bold">Admin Principal</p>
              <p className="text-xs text-slate-500 text-ellipsis overflow-hidden">sec-ops@careertrack.io</p>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Supervisión & Auditoría</h1>
            <p className="text-sm text-gray-500 mt-1">Panel de control de calidad y cumplimiento corporativo.</p>
          </div>
          <button className="bg-slate-800 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-900 transition-colors text-sm flex items-center gap-2 shadow-sm">
            📥 Descargar Reporte PDF
          </button>
        </header>

        {}
        <main className="flex-1 overflow-y-auto p-8">
          
          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
              <p className="text-xs font-bold text-gray-500 uppercase">Profesionales Registrados</p>
              <div className="flex items-end gap-3 mt-2">
                <h3 className="text-3xl font-black text-slate-800">48,290</h3>
                <span className="text-sm font-bold text-emerald-500 mb-1">+12.4%</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-purple-500">
              <p className="text-xs font-bold text-gray-500 uppercase">Compañías Validadas</p>
              <div className="flex items-end gap-3 mt-2">
                <h3 className="text-3xl font-black text-slate-800">1,845</h3>
                <span className="text-sm font-bold text-emerald-500 mb-1">+8.1%</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-emerald-500">
              <p className="text-xs font-bold text-gray-500 uppercase">Score de Calidad</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2">99.2%</h3>
            </div>
          </div>

          {}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Registro de Ofertas Auditables</h3>
              <input type="text" placeholder="Buscar ID, Empresa..." className="text-sm border border-gray-300 rounded-md px-3 py-1.5 w-64 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-white border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-bold">ID & Cargo</th>
                  <th className="px-6 py-4 font-bold">Compañía Emisora</th>
                  <th className="px-6 py-4 font-bold">Fecha Publicación</th>
                  <th className="px-6 py-4 font-bold">Estado</th>
                  <th className="px-6 py-4 text-right font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditoriaOfertas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-400 block mb-1">{item.id}</span>
                      <span className="font-bold text-slate-900">{item.cargo}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{item.empresa}</td>
                    <td className="px-6 py-4">{item.fecha}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.estado === 'Aprobada' ? 'bg-emerald-100 text-emerald-700' :
                        item.estado === 'En Revisión' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 font-semibold hover:text-blue-800">Revisar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  );
}
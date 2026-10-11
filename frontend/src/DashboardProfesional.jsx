import React, { useState } from 'react';

export default function DashboardProfesional() {
  const [modalAbierto, setModalAbierto] = useState(false);

  const ofertasSimuladas = [
    {
      id: 1,
      cargo: "Senior Frontend Engineer (React/TypeScript)",
      empresa: "Fintech Global Inc.",
      salario: "$4,500 - $5,800 USD",
      match: "98%",
      tiempo: "Hace 2 horas",
      modalidad: "Remoto",
      skills: ["React 18", "TypeScript", "Next.js 14", "Tailwind CSS"]
    },
    {
      id: 2,
      cargo: "Tech Lead Full Stack (Node & React)",
      empresa: "CloudScale AI Labs",
      salario: "$5,500 - $7,200 USD",
      match: "94%",
      tiempo: "Hace 5 horas",
      modalidad: "Remoto Global",
      skills: ["Node.js", "React.js", "GraphQL", "PostgreSQL"]
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 relative">
      
      {}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white font-bold px-2 py-1 rounded text-sm">CT</div>
          <span className="font-bold text-blue-900 text-xl">CareerTrack</span>
        </div>
        <div className="flex gap-6 items-center">
            <span className="text-sm font-semibold text-blue-600 cursor-pointer border-b-2 border-blue-600 pb-1">Explorar</span>
            <span className="text-sm font-medium text-gray-500 hover:text-blue-600 cursor-pointer">Mis Postulaciones</span>
            <span className="text-sm font-medium text-gray-500 hover:text-blue-600 cursor-pointer">Empresas</span>
            <div className="h-9 w-9 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold ml-4 cursor-pointer">
              AZ
            </div>
        </div>
      </nav>

      {}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <p className="text-blue-600 font-bold text-xs tracking-wider uppercase mb-2">Recomendaciones Personalizadas</p>
          <h1 className="text-3xl font-extrabold text-slate-900">¡Hola de nuevo, Andrés!</h1>
          <p className="text-gray-500 mt-2 font-medium">Descubre oportunidades seleccionadas con precisión para tu perfil de Desarrollador.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {}
          <div className="lg:col-span-2 space-y-5">
            {ofertasSimuladas.map(oferta => (
              <div key={oferta.id} className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-bold text-gray-700">{oferta.empresa}</span>
                        <span className="text-xs text-gray-400">• {oferta.tiempo}</span>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{oferta.match} Match</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{oferta.cargo}</h2>
                    <p className="text-sm text-gray-500 mt-1">🌍 {oferta.modalidad}</p>
                  </div>
                  <div className="text-right">
                      <span className="text-blue-700 font-bold block">{oferta.salario}</span>
                      <span className="text-xs text-gray-400 font-medium">/mes</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {oferta.skills.map(skill => (
                    <span key={skill} className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-5 border-t border-gray-100">
                  <button className="text-sm font-semibold text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1">
                    ♡ Guardar Favorito
                  </button>
                  <div className="flex gap-4">
                    <button className="text-sm font-semibold text-slate-500 hover:text-slate-700">Ver detalles</button>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm shadow-sm">
                      Postular →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {}
          <div className="lg:col-span-1 space-y-6">
            
            {}
            <div className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl">
              <h3 className="font-bold text-slate-900 mb-4">Gestión de Documentos</h3>
              
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                <div className="text-2xl mt-1">📄</div>
                <div>
                  <p className="text-sm font-bold text-slate-800 break-all">CV_AndresZerpa_2026.pdf</p>
                  <p className="text-xs text-slate-500 mt-0.5">Subido el 15 Oct 2026 • 2.4 MB</p>
                </div>
              </div>

              <button 
                onClick={() => setModalAbierto(true)}
                className="w-full py-2.5 text-sm font-bold text-slate-700 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-all"
              >
                Actualizar Currículum
              </button>
            </div>

            {}
            <div className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl sticky top-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900">Mis Postulaciones</h3>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">2 activas</span>
              </div>
              <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <div>
                        <p className="font-bold text-sm text-slate-900">Frontend Lead Architect</p>
                        <p className="text-xs text-gray-500 mt-0.5">Globant Enterprise</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">En revisión</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                        <p className="font-bold text-sm text-slate-900">Sr. React Developer</p>
                        <p className="text-xs text-gray-500 mt-0.5">Rappi Bank Tech</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">Entrevista</span>
                    </div>
                  </div>
              </div>
              <button className="w-full mt-6 py-2.5 text-sm font-bold text-blue-600 bg-white border-2 border-blue-50 hover:bg-blue-50 hover:border-blue-100 rounded-lg transition-all">
                Ver todo mi proceso →
              </button>
            </div>
          </div>
        </div>
      </div>

      {}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Actualizar Documento</h2>
              <button onClick={() => setModalAbierto(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-light">×</button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                Sube tu currículum más reciente. Las empresas a las que ya te postulaste verán la versión actualizada.
              </p>
              
              {}
              <div className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-xl p-8 text-center hover:bg-blue-100 transition-colors cursor-pointer mb-6">
                <div className="text-3xl mb-3">📁</div>
                <p className="text-sm font-bold text-blue-700 mb-1">Haz clic para subir un archivo</p>
                <p className="text-xs text-gray-500">o arrastra tu PDF aquí (Máx. 5MB)</p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setModalAbierto(false)}
                  className="w-1/2 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => setModalAbierto(false)}
                  className="w-1/2 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Guardar CV
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
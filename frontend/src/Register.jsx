import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [rol, setRol] = useState('compania'); 
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      
      {}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="bg-blue-600 text-white font-bold px-2 py-1 rounded text-xl">CT</div>
          <span className="text-3xl font-bold text-blue-900">CareerTrack</span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">Crea tu cuenta</h2>
        <p className="mt-2 text-sm text-gray-600">
          Únete como <span className="font-semibold text-blue-600">Profesional</span> o da de alta a tu <span className="font-semibold text-blue-600">Compañía</span>.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
          
          {}
          <div className="flex p-1 bg-slate-100 rounded-lg mb-8">
            <button
              onClick={() => setRol('profesional')}
              className={`w-1/2 py-2.5 text-sm font-bold rounded-md transition-all ${rol === 'profesional' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              👨‍💻 Soy Profesional
            </button>
            <button
              onClick={() => setRol('compania')}
              className={`w-1/2 py-2.5 text-sm font-bold rounded-md transition-all ${rol === 'compania' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              🏢 Soy Compañía
            </button>
          </div>

          {}
          <form className="space-y-5">
            
            {}
            {rol === 'compania' ? (
              <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre Comercial</label>
                  <input type="text" placeholder="Ej. TechVentures Inc." className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Identificación Fiscal</label>
                  <input type="text" placeholder="Ej. RIF / NIT" className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre Completo</label>
                  <input type="text" placeholder="Ej. Andrés Zerpa" className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Titular / Cargo</label>
                  <input type="text" placeholder="Ej. Desarrollador Web" className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm" />
                </div>
              </div>
            )}

            {}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Correo Electrónico (Acceso)</label>
              <input type="email" placeholder="contacto@empresa.com" className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Contraseña</label>
              <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm" />
            </div>

            <div className="pt-2">
              {}
              <button 
                type="button"
                onClick={() => navigate(rol === 'profesional' ? '/dashboard' : '/empresa')}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              >
                Completar Registro
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta en CareerTrack?{' '}
              <Link to="/" className="font-bold text-blue-600 hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
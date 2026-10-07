import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function Login() {
  const [rol, setRol] = useState('profesional');
  const navigate = useNavigate();



  return (
    <div className="min-h-screen flex font-sans">
      {}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-24 bg-white">
        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-blue-600 text-white font-bold px-2 py-1 rounded">CT</div>
            <span className="text-xl font-bold text-blue-900">CareerTrack</span>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido de nuevo</h2>
          <p className="text-gray-500 mb-8 text-sm">Ingresa tus credenciales para acceder a tus oportunidades laborales y herramientas de contratación.</p>
          
          {}
          <div className="flex border-b mb-6">
            <button 
              onClick={() => setRol('profesional')}
              className={`w-1/2 py-2 text-center text-sm font-semibold transition-colors ${rol === 'profesional' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Profesional
            </button>
            <button 
              onClick={() => setRol('compania')}
              className={`w-1/2 py-2 text-center text-sm font-semibold transition-colors ${rol === 'compania' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Compañía
            </button>
          </div>

          {}
          <form className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Correo Electrónico</label>
              <input type="email" placeholder="ejemplo@careertrack.com" className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Contraseña</label>
                <a href="#" className="text-xs text-blue-600 hover:underline font-medium">¿Olvidé mi contraseña?</a>
              </div>
              <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm" />
            </div>
            
            <div className="flex items-center pt-2">
              <input type="checkbox" className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-600" />
              <span className="text-sm text-gray-600">Mantener mi sesión iniciada en este dispositivo</span>
            </div>

            <button 
                type="button" 
                onClick={() => navigate(rol === 'profesional' ? '/dashboard' : '/empresa')} 
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition-colors mt-4"
                  >
                Iniciar sesión
                </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-8">
            ¿No tienes una cuenta en CareerTrack? <a href="#" className="text-blue-600 font-bold hover:underline">Registrarse gratis</a>
          </p>
        </div>
      </div>

      {}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-700 p-12 flex-col justify-center text-white relative overflow-hidden">
        {}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        <div className="max-w-lg mx-auto relative z-10">
          <h2 className="text-5xl font-extrabold mb-6 leading-tight">Impulsa tu carrera o encuentra al candidato ideal.</h2>
          <p className="text-blue-100 mb-12 text-lg">Accede a la red donde coinciden profesionales de alto impacto, empresas líderes y administradores de talento.</p>
          
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="bg-blue-800/50 p-6 rounded-xl border border-blue-600/30 backdrop-blur-sm">
              <h3 className="text-4xl font-bold mb-1">+15,000</h3>
              <p className="text-sm text-blue-200">Ofertas laborales activas para Profesionales</p>
            </div>
            <div className="bg-blue-800/50 p-6 rounded-xl border border-blue-600/30 backdrop-blur-sm">
              <h3 className="text-4xl font-bold mb-1">98.4%</h3>
              <p className="text-sm text-blue-200">Compatibilidad en matching corporativo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
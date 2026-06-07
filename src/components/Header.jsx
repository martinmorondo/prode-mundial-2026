import React from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import logo from '../assets/logo-rondero.webp'; 

export default function Header({ userProfile }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-emerald-500/20 sticky top-0 z-50 shadow-md">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Branding con logo más grande */}
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="Logo La Ronda" 
            className="w-12 h-12 object-contain" 
          />
          <span className="font-black text-xl tracking-tight text-white">
            PRODE <span className="text-emerald-400">RONDERO</span>
          </span>
        </div>

        {/* User Profile + Logout */}
        <div className="flex items-center gap-3">
          {/* Perfil */}
          <div className="flex items-center gap-2 bg-slate-800 pr-3 pl-1 py-1 rounded-full border border-emerald-500/30 shadow-inner">
            <span className="text-xl bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center">
              {userProfile?.avatar || '⚽'}
            </span>
            <span className="text-sm font-semibold text-emerald-300">
              {userProfile?.name || 'Jugador'}
            </span>
          </div>

          {/* Botón de Salir */}
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-full transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
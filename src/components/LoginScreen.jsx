import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react'; // Quitamos Globe2[cite: 10]
import logo from '../assets/logo-rondero.webp'; // Importamos tu logo

const AVATARS = ['⚽', '🏆', '🦁', '🦅', '🌪️', '🦈', '🦍', '🐉', '👽', '🤖']; //[cite: 10]

export default function LoginScreen({ onAuthAction, isSaving }) { //[cite: 10]
  const [isRegistering, setIsRegistering] = useState(false); //[cite: 10]
  const [email, setEmail] = useState(''); //[cite: 10]
  const [password, setPassword] = useState(''); //[cite: 10]
  const [name, setName] = useState(''); //[cite: 10]
  const [avatar, setAvatar] = useState('⚽'); //[cite: 10]

  const handleSubmit = (e) => { //[cite: 10]
    e.preventDefault(); //[cite: 10]
    if (!email || !password) return; //[cite: 10]
    
    onAuthAction({ //[cite: 10]
      type: isRegistering ? 'register' : 'login', //[cite: 10]
      email, //[cite: 10]
      password, //[cite: 10]
      name: name.trim(), //[cite: 10]
      avatar //[cite: 10]
    }); //[cite: 10]
  }; //[cite: 10]

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-200">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500"></div>
        
        {/* --- LOGO DE LA RONDA --- */}
        <img 
          src={logo} 
          alt="Logo La Ronda" 
          className="w-24 h-24 object-contain mx-auto mb-2 drop-shadow-[0_0_15px_rgba(52,211,153,0.2)] hover:scale-105 transition-transform" 
        />
        
        <h1 className="text-2xl font-black text-center text-white mb-1">PRODE 2026</h1>
        {/* Actualizamos el texto de la comunidad */}
        <p className="text-emerald-400/80 text-center text-xs font-medium mb-6">Comunidad La Ronda</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="tu@email.com"/>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Contraseña</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="••••••••"/>
          </div>

          {isRegistering && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Tu Apodo / Nombre</label>
                <input type="text" required={isRegistering} value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="Ej: El Dibu, Messi10" maxLength={20}/>
              </div>
              <div>
                <label className="block text-center text-xs font-semibold text-slate-400 uppercase mb-2">Elige tu Avatar</label>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {AVATARS.map(av => (
                    <button type="button" key={av} onClick={() => setAvatar(av)} className={`text-2xl p-1.5 rounded-lg transition-all ${avatar === av ? 'bg-emerald-500/20 border border-emerald-500 scale-105' : 'bg-slate-800 opacity-40 hover:opacity-100'}`}>{av}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={isSaving} className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
            {isSaving ? 'PROCESANDO...' : isRegistering ? 'REGISTRARME E INGRESAR' : 'ENTRAR A LA CANCHA'}
            {isRegistering ? <UserPlus className="w-4 h-4"/> : <LogIn className="w-4 h-4"/>}
          </button>
        </form>

        <div className="mt-6 text-center text-xs">
          <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-emerald-400 hover:underline font-semibold">
            {isRegistering ? '¿Ya tienes una cuenta? Inicia Sesión' : '¿Eres nuevo? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}
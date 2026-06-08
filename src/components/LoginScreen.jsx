import React, { useState } from 'react';
import { LogIn, UserPlus, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'; 
import logo from '../assets/logo-rondero.webp'; 

const AVATARS = ['⚽', '🏆', '🦁', '🦅', '🌪️', '🦈', '🦍', '🐉', '👽', '🤖']; 

export default function LoginScreen({ onAuthAction, isSaving }) { 
  const [isRegistering, setIsRegistering] = useState(false); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [showPassword, setShowPassword] = useState(false); // <-- Estado para el ojo
  const [name, setName] = useState(''); 
  const [avatar, setAvatar] = useState('⚽'); 

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    if (!email || !password) return; 
    
    onAuthAction({ 
      type: isRegistering ? 'register' : 'login', 
      email, 
      password, 
      name: name.trim(), 
      avatar 
    }); 
  }; 

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-200">
      {/* Cambiamos a rounded-3xl y ajustamos sombras para un look de App */}
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-t-3xl"></div>
        
        {/* --- LOGO DE LA RONDA --- */}
        <img 
          src={logo} 
          alt="Logo La Ronda" 
          className="w-20 h-20 object-contain mx-auto mb-4 drop-shadow-[0_0_15px_rgba(52,211,153,0.2)] hover:scale-105 transition-transform" 
        />
        
        <h1 className="text-2xl font-black text-center text-white mb-1">PRODE 2026</h1>
        <p className="text-emerald-500 text-center text-sm font-semibold mb-8">Comunidad La Ronda</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* INPUT EMAIL CON ICONO */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email</label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                <Mail size={18} />
              </div>
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" 
                placeholder="tu@email.com"
              />
            </div>
          </div>

          {/* INPUT CONTRASEÑA CON ICONO Y OJO */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Contraseña</label>
            <div className="relative group">
               <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                 <Lock size={18} />
               </div>
               <input 
                 type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} 
                 className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" 
                 placeholder="••••••••" 
               />
               <button 
                 type="button" 
                 onClick={() => setShowPassword(!showPassword)} 
                 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
               >
                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
               </button>
            </div>
          </div>

          {/* CAMPOS DE REGISTRO */}
          {isRegistering && (
            <div className="space-y-5 animate-in slide-in-from-top-2 fade-in duration-300 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Tu Apodo / Nombre</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" required={isRegistering} value={name} onChange={e => setName(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" 
                    placeholder="Ej: El Dibu, Messi10" maxLength={20}
                  />
                </div>
              </div>
              
              {/* GRID DE AVATARES */}
              <div>
                <label className="block text-center text-xs font-bold text-slate-500 uppercase mb-3">Elige tu Avatar</label>
                <div className="grid grid-cols-5 gap-2">
                  {AVATARS.map(av => (
                    <button 
                      type="button" key={av} onClick={() => setAvatar(av)} 
                      className={`text-xl p-2 rounded-xl transition-all ${avatar === av ? 'bg-emerald-500/20 border border-emerald-500 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-slate-800 hover:bg-slate-700 opacity-60 hover:opacity-100'}`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BOTÓN DE ACCIÓN */}
          <button 
            type="submit" disabled={isSaving} 
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-emerald-500/20"
          >
            {isSaving ? 'PROCESANDO...' : isRegistering ? 'REGISTRARME E INGRESAR' : 'ENTRAR A LA CANCHA'}
            {!isSaving && (isRegistering ? <UserPlus size={18}/> : <LogIn size={18}/>)}
          </button>
        </form>

        {/* TOGGLE INICIAR SESIÓN / REGISTRO */}
        <div className="mt-6 text-center">
          <button 
            type="button" onClick={() => setIsRegistering(!isRegistering)} 
            className="text-emerald-400 text-sm font-bold hover:underline transition-colors hover:text-emerald-300"
          >
            {isRegistering ? '¿Ya tienes una cuenta? Inicia Sesión' : '¿Eres nuevo? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}
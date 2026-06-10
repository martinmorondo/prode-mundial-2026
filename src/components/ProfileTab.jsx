import React from 'react';
import { Trophy, Target, Flame, Shield, Star, BarChart3, Medal } from 'lucide-react';

export default function ProfileTab({ userProfile, userRanking, position, totalUsers }) {
  if (!userRanking) {
    return (
      <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 border-dashed animate-in fade-in">
        <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-400">Sin estadísticas aún</h3>
        <p className="text-sm text-slate-500">Espera a que finalicen los primeros partidos.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 slide-in-from-bottom-4 space-y-6">
      
      {/* 1. CABECERA: Perfil y Posición Global */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-xl relative overflow-hidden">
         {/* Brillo de fondo estético */}
         <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
         
         <div className="text-6xl drop-shadow-lg mb-3">{userProfile.avatar || '👤'}</div>
         <h2 className="text-2xl font-black text-white">{userProfile.name}</h2>
         
         <div className="mt-3 inline-flex items-center gap-2 bg-slate-950/50 border border-slate-800 px-4 py-2 rounded-full">
           <Trophy className="w-4 h-4 text-emerald-500" /> 
           <span className="text-slate-300 text-sm">Posición Global:</span>
           <strong className="text-emerald-400 text-lg">#{position}</strong>
           <span className="text-slate-500 text-xs">/ {totalUsers}</span>
         </div>
      </div>

      {/* 2. CUADRÍCULA DE PUNTOS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center text-center shadow-md">
          <Star className="w-6 h-6 text-emerald-400 mb-2" />
          <span className="text-3xl font-black text-white">{userRanking.points}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Pts Totales</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center text-center shadow-md">
          <Target className="w-6 h-6 text-blue-400 mb-2" />
          <span className="text-3xl font-black text-white">{userRanking.exact}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Exactos (3p)</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center text-center shadow-md">
          <BarChart3 className="w-6 h-6 text-slate-400 mb-2" />
          <span className="text-3xl font-black text-white">{userRanking.trends}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Tendencias (1p)</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center text-center shadow-md">
          <Medal className="w-6 h-6 text-amber-400 mb-2" />
          <span className="text-3xl font-black text-white">{userRanking.bonusPoints || 0}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Pts Bonus</span>
        </div>
      </div>

      {/* 3. GAMIFICACIÓN: Medallas y Logros */}
      <div className="pt-2">
        <h3 className="text-emerald-400 font-black text-lg uppercase tracking-widest flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
          Mis Medallas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Tarjeta de Racha */}
           <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-orange-500/30 transition-colors">
             <div className={`p-3 rounded-xl transition-colors ${userRanking.currentStreak >= 3 ? 'bg-orange-500/20 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-slate-800 text-slate-600'}`}>
               <Flame className="w-8 h-8" />
             </div>
             <div>
               <h4 className="text-white font-bold mb-0.5">Racha Actual</h4>
               <p className="text-xs text-slate-400 leading-relaxed">
                 {userRanking.currentStreak >= 3 
                   ? `¡Estás on fire! Llevas ${userRanking.currentStreak} aciertos al hilo.`
                   : `Llevas ${userRanking.currentStreak} aciertos. ¡Llega a 3 para encender la llama!`
                 }
               </p>
             </div>
           </div>

           {/* Tarjeta Cazagigantes */}
           <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-500/30 transition-colors">
             <div className={`p-3 rounded-xl transition-colors ${userRanking.giantKiller > 0 ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-800 text-slate-600'}`}>
               <Shield className="w-8 h-8" />
             </div>
             <div>
               <h4 className="text-white font-bold mb-0.5">Cazagigantes</h4>
               <p className="text-xs text-slate-400 leading-relaxed">
                 {userRanking.giantKiller > 0 
                   ? `¡Impredecible! Acertaste ${userRanking.giantKiller} batacazos contra la mayoría.`
                   : `Aún no has acertado resultados contra la tendencia de la comunidad.`
                 }
               </p>
             </div>
           </div>
        </div>
      </div>

    </div>
  );
}
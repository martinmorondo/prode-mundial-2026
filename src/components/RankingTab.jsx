import React from 'react';
import { Trophy, Medal, Flame, Shield } from 'lucide-react';

export default function RankingTab({ ranking, currentUserUid }) { 
  return (
  <div className="animate-in fade-in">
    <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 mb-6 shadow-lg">
      <p className="text-sm text-emerald-100/80">Puntuación: <strong>3 pts</strong> por resultado exacto. <strong>1 pt</strong> ganador/empate.</p>
    </div>
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-950 text-slate-400 text-xs uppercase border-b border-slate-800">
            <th className="p-4 font-black w-16 text-center">Pos</th>
            <th className="p-4 font-black">Jugador</th>
            <th className="p-4 font-black text-center">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {ranking.length === 0 ? (
            <tr><td colSpan="3" className="p-8 text-center text-slate-500">Sin datos.</td></tr>
          ) : (
            ranking.map((r, idx) => (
              <tr key={r.uid} className={`hover:bg-slate-800/20 transition-colors ${r.uid === currentUserUid ? 'bg-emerald-900/10' : ''}`}>
                <td className="p-4 text-center">
                  {idx < 3 ? <Medal className="w-6 h-6 text-yellow-400 mx-auto" /> : <span className="text-slate-500 font-bold">{idx + 1}</span>}
                </td>
                <td className="p-4">
                  <div className="font-bold text-white flex items-center flex-wrap gap-2">
                    <span className="text-2xl drop-shadow-md">{r.avatar || '👤'}</span>
                    <span className="text-lg truncate max-w-[120px] sm:max-w-none">{r.name}</span>
                    
                    {r.uid === currentUserUid && (
                      <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase">
                        Tú
                      </span>
                    )}

                    {/* MEDALLAS DE GAMIFICACIÓN */}
                    <div className="flex gap-1.5 ml-1">
                      {/* Racha (Aparece si tiene 3 o más aciertos consecutivos) */}
                      {r.currentStreak >= 3 && (
                        <span 
                          title={`¡En racha! ${r.currentStreak} aciertos al hilo`} 
                          className="flex items-center text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full text-[10px] font-black"
                        >
                          <Flame className="w-3 h-3 mr-0.5 fill-orange-500" /> {r.currentStreak}
                        </span>
                      )}

                      {/* Cazagigantes (Aparece si acertó batacazos contra la mayoría) */}
                      {r.giantKiller > 0 && (
                        <span 
                          title={`Cazagigantes: ${r.giantKiller} batacazos acertados`} 
                          className="flex items-center text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full text-[10px] font-black"
                        >
                          <Shield className="w-3 h-3 mr-0.5 fill-indigo-500" /> {r.giantKiller}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center font-black text-2xl text-emerald-400">{r.points}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
  );
}
import React from 'react';
import { Trophy } from 'lucide-react';
import { Medal } from 'lucide-react';

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
                  <div className="font-bold text-white flex items-center gap-3">
                    <span className="text-2xl drop-shadow-md">{r.avatar || '👤'}</span>
                    <span className="text-lg">{r.name}</span>
                    {r.uid === currentUserUid && <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase">Tú</span>}
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
import React from 'react';
import { Trophy } from 'lucide-react';

export default function Header({ userProfile }) {
  return (
    <header className="bg-slate-900 border-b border-emerald-500/20 sticky top-0 z-50 shadow-md">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-emerald-400" />
          <span className="font-black text-xl tracking-tight text-white">
            PRODE <span className="text-emerald-400">IN15</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800 pr-3 pl-1 py-1 rounded-full border border-emerald-500/30 shadow-inner">
            <span className="text-xl bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center">{userProfile?.avatar || '⚽'}</span>
            <span className="text-sm font-semibold text-emerald-300">
              {userProfile?.name || 'Jugador'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
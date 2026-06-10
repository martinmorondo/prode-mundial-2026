import React, { useEffect } from 'react';
import { Trophy, X, Zap } from 'lucide-react';

export default function PointsNotification({ points, onClose }) {
  // Autocierre después de 6 segundos para no molestar
  useEffect(() => {
    if (points > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [points, onClose]);

  if (!points || points <= 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500 w-[90%] max-w-sm">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 p-[2px] rounded-2xl shadow-2xl shadow-emerald-900/50">
        <div className="bg-slate-950/95 backdrop-blur-md px-5 py-4 rounded-2xl flex items-center gap-4">
          <div className="bg-emerald-500/20 p-2.5 rounded-full text-emerald-400 animate-bounce shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Trophy className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-black text-sm uppercase tracking-wide flex items-center gap-1.5 mb-0.5">
              ¡Resultados listos! <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            </h4>
            <p className="text-slate-300 text-sm">
              Sumaste <span className="text-xl font-black text-emerald-400 mx-1">+{points}</span> pts.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors bg-slate-900 hover:bg-slate-800 p-1.5 rounded-full border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
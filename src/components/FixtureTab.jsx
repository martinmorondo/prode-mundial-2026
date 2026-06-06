import React from 'react';
import { Calendar } from 'lucide-react';
import MatchCard from './MatchCard';

export default function FixtureTab({ matches, myPredictions, handlePredictionChange, savePrediction, matchStats }) {
  const groupedMatches = matches.reduce((acc, match) => {
    const groupName = match.group || 'Fase de Grupos';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(match);
    return acc;
  }, {});

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 border-dashed animate-in fade-in">
        <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-400">El fixture aún no está cargado.</h3>
        <p className="text-sm text-slate-500">Espera a que el administrador sincronice los partidos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 slide-in-from-bottom-4">
      {Object.entries(groupedMatches).map(([group, groupMatches]) => (
        <div key={group} className="space-y-4">
          <h2 className="text-emerald-400 font-black text-xl uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            {group}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {groupMatches.map(match => (
              <MatchCard 
                key={match.id} 
                match={match} 
                prediction={myPredictions[match.id]} 
                onPredictionChange={handlePredictionChange}
                onSavePrediction={savePrediction}
                stats={matchStats ? matchStats[match.id] : null}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
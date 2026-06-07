import React from 'react';
import { CheckCircle } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag'; 

// Función para calcular los puntos que muestra la tarjeta finalizada
const calculateMatchPoints = (predHome, predAway, realHome, realAway) => {
  if (predHome === undefined || predAway === undefined || realHome === undefined || realAway === undefined) return 0;
  if (predHome === '' || predAway === '' || realHome === '' || realAway === '') return 0;
  const ph = parseInt(predHome, 10), pa = parseInt(predAway, 10);
  const rh = parseInt(realHome, 10), ra = parseInt(realAway, 10);
  if (isNaN(ph) || isNaN(pa) || isNaN(rh) || isNaN(ra)) return 0;
  if (ph === rh && pa === ra) return 3; 
  const predTrend = ph - pa > 0 ? 'home' : ph - pa < 0 ? 'away' : 'draw';
  const realTrend = rh - ra > 0 ? 'home' : rh - ra < 0 ? 'away' : 'draw';
  if (predTrend === realTrend) return 1; 
  return 0; 
};

export default function MatchCard({ match, prediction, onPredictionChange, onSavePrediction, stats }) { 
  const isFinished = match.status === 'finished';
  const myPred = prediction || {};
  
  // Lógica de estilos basados en la importancia del partido
  let cardStyle = "bg-slate-900 border-slate-700 hover:border-emerald-500/50";
  let titleStyle = "text-slate-500";
  
  if (isFinished) {
    cardStyle = "bg-slate-900/50 border-slate-800 opacity-75";
  } else if (match.group?.toUpperCase().includes('FINAL')) {
    // Dorado para la final
    cardStyle = "bg-gradient-to-br from-slate-900 via-slate-900 to-amber-900/30 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:border-amber-400 scale-[1.02]";
    titleStyle = "text-amber-500 font-black tracking-widest";
  } else if (match.group?.toUpperCase().includes('SF') || match.group?.toUpperCase().includes('QF') || match.group?.toUpperCase().includes('R16')) {
    // Morado para eliminación directa
    cardStyle = "bg-gradient-to-br from-slate-900 to-purple-900/20 border-purple-500/30 hover:border-purple-400";
    titleStyle = "text-purple-400 font-bold";
  }
  
  return (
    <div className={`p-5 rounded-2xl border relative overflow-hidden transition-all duration-300 ${cardStyle}`}>
      {isFinished && (
        <div className="absolute top-0 right-0 bg-slate-800 text-slate-400 text-[10px] font-bold px-3 py-1 rounded-bl-lg">FINALIZADO</div>
      )}
      <div className={`text-xs mb-4 text-center uppercase ${titleStyle}`}>
        {match.group} • {match.date || 'Fecha por definir'}
      </div>
      
      <div className="flex items-center justify-between mb-5">
        {/* --- BANDERA LOCAL --- */}
        <div className="flex flex-col items-center w-[30%]">
          <div className="mb-3 transition-transform hover:scale-110 flex justify-center">
            {match.flagH && match.flagH.length === 2 ? (
              <ReactCountryFlag 
                countryCode={match.flagH} 
                svg 
                style={{
                  width: '3.5em', 
                  height: '3.5em', 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.4)'
                }} 
                title={match.home} 
              />
            ) : (
              <span className="text-5xl drop-shadow-lg">{match.flagH || '🏁'}</span>
            )}
          </div>
          <span className="font-bold text-sm text-center leading-tight text-white">{match.home}</span>
        </div>
        
        {/* --- INPUTS DE SCORE --- */}
        <div className="flex items-center gap-2 w-[40%] justify-center">
          <input 
            type="number" min="0" max="15" disabled={isFinished}
            value={myPred.homeScore !== undefined ? myPred.homeScore : ''}
            onChange={(e) => onPredictionChange(match.id, 'homeScore', e.target.value)}
            className="w-12 h-14 bg-slate-950/80 border border-slate-600 rounded-xl text-center text-2xl font-black text-white focus:border-emerald-500 outline-none disabled:opacity-50 transition-colors shadow-inner"
          />
          <span className="text-slate-500 font-bold">-</span>
          <input 
            type="number" min="0" max="15" disabled={isFinished}
            value={myPred.awayScore !== undefined ? myPred.awayScore : ''}
            onChange={(e) => onPredictionChange(match.id, 'awayScore', e.target.value)}
            className="w-12 h-14 bg-slate-950/80 border border-slate-600 rounded-xl text-center text-2xl font-black text-white focus:border-emerald-500 outline-none disabled:opacity-50 transition-colors shadow-inner"
          />
        </div>
        
        {/* --- BANDERA VISITANTE --- */}
        <div className="flex flex-col items-center w-[30%]">
          <div className="mb-3 transition-transform hover:scale-110 flex justify-center">
            {match.flagA && match.flagA.length === 2 ? (
              <ReactCountryFlag 
                countryCode={match.flagA} 
                svg 
                style={{
                  width: '3.5em', 
                  height: '3.5em', 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.4)'
                }} 
                title={match.away} 
              />
            ) : (
              <span className="text-5xl drop-shadow-lg">{match.flagA || '🏁'}</span>
            )}
          </div>
          <span className="font-bold text-sm text-center leading-tight text-white">{match.away}</span>
        </div>
      </div>
      
      {!isFinished ? (
        <button 
          onClick={() => onSavePrediction(match.id)}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
            (myPred.homeScore !== undefined && myPred.awayScore !== undefined)
              ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-600/30"
              : "bg-slate-950/50 text-slate-400 border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400"
          }`}
        >
          <CheckCircle className="w-5 h-5" /> 
          { (myPred.homeScore !== undefined && myPred.awayScore !== undefined) 
            ? "Pronóstico Guardado ✅" 
            : "Confirmar Pronóstico" 
          }
        </button>
      ) : (
        <div className="mt-2 pt-3 border-t border-slate-800/50 text-center bg-slate-950/30 rounded-xl pb-2">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Resultado Real</div>
          <div className="font-black text-2xl text-white tracking-wider">{match.realHomeScore} - {match.realAwayScore}</div>
          {myPred.homeScore !== undefined && (
            <div className="text-xs mt-2 font-semibold flex items-center justify-center gap-2">
              <span className="text-slate-400">Tu pronóstico: {myPred.homeScore}-{myPred.awayScore}</span>
              <span className={`px-2 py-0.5 rounded-full ${calculateMatchPoints(myPred.homeScore, myPred.awayScore, match.realHomeScore, match.realAwayScore) > 0 ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
                +{calculateMatchPoints(myPred.homeScore, myPred.awayScore, match.realHomeScore, match.realAwayScore)} pts
              </span>
            </div>
          )}
        </div>
      )}
      {/* --- TERMÓMETRO DE LA COMUNIDAD --- */}
      {stats && stats.total > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800/50">
          <div className="flex justify-between items-end mb-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              🔥 Termómetro <span className="normal-case font-normal text-slate-500">({stats.total} {stats.total === 1 ? 'voto' : 'votos'})</span>
            </div>
            <div className="flex gap-3 text-[10px] font-bold">
              <span className="text-emerald-400">{stats.home}% L</span>
              <span className="text-slate-400">{stats.draw}% E</span>
              <span className="text-blue-400">{stats.away}% V</span>
            </div>
          </div>
          
          {/* Barra de progreso dividida en 3 colores */}
          <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-slate-800">
            <div style={{ width: `${stats.home}%` }} className="bg-emerald-500 transition-all duration-1000"></div>
            <div style={{ width: `${stats.draw}%` }} className="bg-slate-500 transition-all duration-1000"></div>
            <div style={{ width: `${stats.away}%` }} className="bg-blue-500 transition-all duration-1000"></div>
          </div>
        </div>
      )}
    </div>
  );
};
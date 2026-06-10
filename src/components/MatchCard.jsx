import React, { useState, useRef } from 'react';
import { CheckCircle, ChevronUp, ChevronDown, Lock, Camera, AlertCircle, Zap, HelpCircle } from 'lucide-react'; 
import ReactCountryFlag from 'react-country-flag'; 
import { toPng } from 'html-to-image'; 

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

export default function MatchCard({ match, prediction, onPredictionChange, onSavePrediction, stats, activeJokerMatchId }) { 
  const isFinished = match.status === 'finished';
  const myPred = prediction || {};
  const isJoker = myPred.isJoker === true; 
  
  const cardRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false); 
  const [isDirty, setIsDirty] = useState(false); 
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  
  const now = new Date();
  let isLockedByTime = false;
  let displayDate = match.date; 

  if (match.date && !match.date.toLowerCase().includes('definir')) {
    try {
      const [datePart, timePart] = match.date.split(' ');
      if (datePart && timePart) {
        const [d, m, y] = datePart.split('/');
        const [h, min] = timePart.split(':');
        
        const matchDate = new Date(Date.UTC(y, m - 1, d, h, min));
        const options = { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' };
        displayDate = matchDate.toLocaleString('es-AR', options); 

        const cutoffTime = new Date(matchDate.getTime() - (60 * 60 * 1000));
        if (now >= cutoffTime) {
          isLockedByTime = true;
        }
      }
    } catch (e) {
      console.warn("No se pudo parsear la fecha para el bloqueo:", match.date);
    }
  }

  const isLocked = isFinished || isLockedByTime;
  const canToggleJoker = !isLocked && (!activeJokerMatchId || activeJokerMatchId === match.id);

  let cardStyle = "bg-slate-900 border-slate-700 hover:border-emerald-500/50";
  let titleStyle = "text-slate-500";
  
  if (isJoker && !isFinished) {
    cardStyle = "bg-slate-900 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
  } else if (isFinished) {
    cardStyle = "bg-slate-900/50 border-slate-800 opacity-75";
  } else if (match.group?.toUpperCase().includes('FINAL')) {
    cardStyle = "bg-gradient-to-br from-slate-900 via-slate-900 to-amber-900/30 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:border-amber-400 scale-[1.02]";
    titleStyle = "text-amber-500 font-black tracking-widest";
  }

  const handleScoreChange = (type, val) => {
    if (isLocked) return;
    setIsDirty(true);
    onPredictionChange(match.id, type, val);
  };

  const changeByButton = (type, increment) => {
    if (isLocked) return;
    setIsDirty(true);
    let val = parseInt(myPred[type], 10);
    if (isNaN(val)) val = 0;
    let newVal = val + increment;
    if (newVal < 0) newVal = 0;
    if (newVal > 15) newVal = 15; 
    onPredictionChange(match.id, type, newVal.toString());
  };

  const handleJokerToggle = () => {
    if (isLocked) return;
    if (!canToggleJoker) {
      alert("⚠️ Ya utilizaste tu comodín en otro partido de este grupo. Primero desactívalo allí.");
      return;
    }
    setIsDirty(true);
    onPredictionChange(match.id, 'isJoker', !isJoker);
  };

  const hasValues = myPred.homeScore !== undefined && myPred.homeScore !== '' && myPred.awayScore !== undefined && myPred.awayScore !== '';

  const handleSave = () => {
    if (isLocked) return;
    if (!hasValues) {
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 2000); 
      return; 
    }
    setIsDirty(false); 
    onSavePrediction(match.id);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 1500);
  };

  const handleShare = async () => {
    if (cardRef.current === null) return;
    setIsCapturing(true); 
    // SUBIMOS A 300ms PARA DARLE TIEMPO A LOS ESTILOS CSS A APLICARSE BIEN
    setTimeout(async () => {
      try {
        const dataUrl = await toPng(cardRef.current, { 
          cacheBust: true, backgroundColor: '#0f172a', pixelRatio: 2, style: { margin: '0' }
        });
        const link = document.createElement('a');
        link.download = `Prode-${match.home}-vs-${match.away}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) { 
        console.error(err); 
      } finally { 
        setIsCapturing(false); 
      }
    }, 300);
  };

  let btnText = "Confirmar Pronóstico";
  let btnStyle = "bg-slate-950/50 text-slate-400 border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400";

  if (hasValues) {
    if (isDirty) {
      btnText = "Actualizar Pronóstico 🔄";
      btnStyle = "bg-blue-600/20 text-blue-400 border-blue-500/50 hover:bg-blue-600/30"; 
    } else {
      btnText = "Pronóstico Guardado ✅";
      btnStyle = "bg-emerald-600/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-600/30"; 
    }
  }
  
  const basePts = calculateMatchPoints(myPred.homeScore, myPred.awayScore, match.realHomeScore, match.realAwayScore);
  const finalPts = isJoker ? basePts * 2 : basePts;

  return (
    <div ref={cardRef} className={`p-5 rounded-2xl border relative overflow-hidden transition-all duration-300 ${cardStyle}`}>
      
      {/* Banner SUPERIOR (Solo visible en la foto usando CSS) */}
      <div className={`w-full justify-center mb-3 ${isCapturing ? 'flex' : 'hidden'}`}>
        <div className="bg-emerald-950/60 border border-emerald-900/50 px-4 py-1 rounded-full text-[10px] font-black text-emerald-500 tracking-widest uppercase shadow-lg">
          PRODE LA RONDA 2026
        </div>
      </div>

      {/* BOTÓN COMODÍN Y AYUDA (Se ocultan en la foto usando CSS) */}
      <div className={`absolute top-0 left-0 z-10 gap-0 ${isCapturing ? 'hidden' : 'flex'}`}>
        <button 
          onClick={handleJokerToggle}
          disabled={!canToggleJoker && !isJoker}
          className={`px-3 py-1.5 text-[10px] font-bold rounded-br-lg flex items-center gap-1 transition-all
            ${isJoker 
              ? 'bg-amber-500 text-amber-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]' 
              : canToggleJoker 
                ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-amber-400'
                : 'bg-slate-900/80 text-slate-600 cursor-not-allowed'
            }
          `}
          title={isJoker ? "Comodín Activado" : "Activar Comodín"}
        >
          <Zap className="w-3 h-3" fill={isJoker ? "currentColor" : "none"} /> 
          {isJoker ? 'x2 Pts' : 'Comodín'}
        </button>
        
        <button 
          onClick={() => setShowInfoPopup(true)}
          className="bg-slate-800/80 text-slate-400 px-1.5 py-1.5 rounded-br-lg hover:text-blue-400 transition-colors"
          title="¿Qué es el comodín?"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* POP-UPS */}
      {showInfoPopup && !isCapturing && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4" onClick={() => setShowInfoPopup(false)}>
          <div className="bg-slate-800 border border-amber-500 text-white p-6 rounded-2xl shadow-2xl animate-in zoom-in-50 duration-300">
            <div className="flex justify-center mb-3 text-amber-500"><Zap className="w-10 h-10" /></div>
            <h3 className="font-bold text-lg text-center mb-2">¡Doble Puntaje!</h3>
            <p className="text-sm text-slate-300 text-center">
              Si activás el comodín en este partido y acertás el resultado exacto o la tendencia, <b>tus puntos se multiplicarán por 2</b>. 
              <br/><br/>
              Solo podés usar un comodín por grupo.
            </p>
            <button className="mt-5 w-full bg-blue-600 py-2 rounded-lg font-bold">¡Entendido!</button>
          </div>
        </div>
      )}
      {showErrorPopup && !isCapturing && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-red-500 text-white px-5 py-3 rounded-2xl font-black flex items-center gap-2 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-in zoom-in-50 duration-300">
            <AlertCircle className="w-6 h-6" /> ¡INGRESA UN RESULTADO!
          </div>
        </div>
      )}

      {isFinished ? (
        <div className="absolute top-0 right-0 bg-slate-800 text-slate-400 text-[10px] font-bold px-3 py-1.5 rounded-bl-lg z-10">FINALIZADO</div>
      ) : isLockedByTime ? (
        <div className="absolute top-0 right-0 bg-red-900/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-lg z-10 shadow-lg">CERRADO</div>
      ) : null}
      
      <div className={`text-xs mb-4 mt-2 text-center uppercase ${titleStyle}`}>
        {match.group} • {displayDate || 'Fecha por definir'}
      </div>
      
      {/* CUERPO DEL PARTIDO (Banderas e inputs) */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex flex-col items-center w-[30%]">
          <div className="mb-3 transition-transform hover:scale-110 flex justify-center">
            {match.flagH && match.flagH.length === 2 ? (
              <ReactCountryFlag countryCode={match.flagH} svg style={{ width: '3.5em', height: '3.5em', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.4)' }} title={match.home} />
            ) : ( <span className="text-5xl drop-shadow-lg">{match.flagH || '🏁'}</span> )}
          </div>
          <span className="font-bold text-sm text-center leading-tight text-white">{match.home}</span>
        </div>
        
        <div className="flex items-center gap-2 w-[40%] justify-center">
          <div className={`flex items-center bg-slate-950/80 border ${isLocked ? 'border-red-900/50' : 'border-slate-600 focus-within:border-emerald-500'} rounded-xl overflow-hidden transition-colors shadow-inner`}>
            {/* Input Local con CSS hidden en vez de condicional */}
            <div className={`w-10 h-14 items-center justify-center text-2xl font-black text-white bg-transparent ${isCapturing ? 'flex' : 'hidden'}`}>{myPred.homeScore}</div>
            <input type="number" min="0" max="15" disabled={isLocked} value={myPred.homeScore !== undefined ? myPred.homeScore : ''} onChange={(e) => handleScoreChange('homeScore', e.target.value)} className={`w-10 h-14 bg-transparent text-center text-2xl font-black text-white outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isLocked ? 'opacity-50 text-slate-500' : ''} ${isCapturing ? 'hidden' : 'block'}`} />
            
            <div className={`flex-col border-l border-slate-700/50 h-full ${isLocked || isCapturing ? 'hidden' : 'flex'}`}>
              <button onClick={() => changeByButton('homeScore', 1)} className="flex-1 px-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors border-b border-slate-700/50 flex items-center justify-center"><ChevronUp className="w-4 h-4" strokeWidth={3} /></button>
              <button onClick={() => changeByButton('homeScore', -1)} className="flex-1 px-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors flex items-center justify-center"><ChevronDown className="w-4 h-4" strokeWidth={3} /></button>
            </div>
          </div>

          <span className="text-slate-500 font-bold">-</span>
          
          <div className={`flex items-center bg-slate-950/80 border ${isLocked ? 'border-red-900/50' : 'border-slate-600 focus-within:border-emerald-500'} rounded-xl overflow-hidden transition-colors shadow-inner`}>
            {/* Input Visitante con CSS hidden en vez de condicional */}
            <div className={`w-10 h-14 items-center justify-center text-2xl font-black text-white bg-transparent ${isCapturing ? 'flex' : 'hidden'}`}>{myPred.awayScore}</div>
            <input type="number" min="0" max="15" disabled={isLocked} value={myPred.awayScore !== undefined ? myPred.awayScore : ''} onChange={(e) => handleScoreChange('awayScore', e.target.value)} className={`w-10 h-14 bg-transparent text-center text-2xl font-black text-white outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isLocked ? 'opacity-50 text-slate-500' : ''} ${isCapturing ? 'hidden' : 'block'}`} />
            
            <div className={`flex-col border-l border-slate-700/50 h-full ${isLocked || isCapturing ? 'hidden' : 'flex'}`}>
              <button onClick={() => changeByButton('awayScore', 1)} className="flex-1 px-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors border-b border-slate-700/50 flex items-center justify-center"><ChevronUp className="w-4 h-4" strokeWidth={3} /></button>
              <button onClick={() => changeByButton('awayScore', -1)} className="flex-1 px-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors flex items-center justify-center"><ChevronDown className="w-4 h-4" strokeWidth={3} /></button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center w-[30%]">
          <div className="mb-3 transition-transform hover:scale-110 flex justify-center">
            {match.flagA && match.flagA.length === 2 ? (
              <ReactCountryFlag countryCode={match.flagA} svg style={{ width: '3.5em', height: '3.5em', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.4)' }} title={match.away} />
            ) : ( <span className="text-5xl drop-shadow-lg">{match.flagA || '🏁'}</span> )}
          </div>
          <span className="font-bold text-sm text-center leading-tight text-white">{match.away}</span>
        </div>
      </div>
      
      {/* SECCIÓN INFERIOR: Botones y Mensajes (Se ocultan con CSS al capturar foto) */}
      <div className={isCapturing ? 'hidden' : 'block'}>
        {!isLocked ? (
          <button onClick={handleSave} className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${btnStyle}`}>
            {btnText.includes('✅') && <CheckCircle className="w-5 h-5" />} {btnText}
          </button>
        ) : isFinished ? (
          <div className="mt-2 pt-3 border-t border-slate-800/50 text-center bg-slate-950/30 rounded-xl pb-2">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Resultado Real</div>
            <div className="font-black text-2xl text-white tracking-wider">{match.realHomeScore} - {match.realAwayScore}</div>
            {myPred.homeScore !== undefined && (
              <div className="text-xs mt-2 font-semibold flex items-center justify-center gap-2">
                <span className="text-slate-400">Tu pronóstico: {myPred.homeScore}-{myPred.awayScore}</span>
                <span className={`px-2 py-0.5 rounded-full ${finalPts > 0 ? (isJoker ? 'bg-amber-900/50 text-amber-400 border border-amber-500/20' : 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/20') : 'bg-slate-800 text-slate-500'}`}>
                  +{finalPts} pts {isJoker && '⚡'}
                </span>
              </div>
            )}
          </div>
        ) : isLockedByTime ? (
          <div className="mt-2 pt-3 border-t border-slate-800/50 text-center bg-red-950/20 rounded-xl pb-2 border border-red-900/30">
            <div className="text-red-400 font-bold flex items-center justify-center gap-2 py-2">
               <Lock className="w-4 h-4" /> El tiempo para pronosticar ha finalizado
            </div>
          </div>
        ) : null}

        {hasValues && !isDirty && (
          <div className="mt-3 flex justify-center">
            <button onClick={handleShare} className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800 hover:border-emerald-500/50" title="Descargar imagen">
              <Camera size={14} /> Compartir Resultado
            </button>
          </div>
        )}

        {/* Termómetro de Comunidad */}
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
            <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-slate-800">
              <div style={{ width: `${stats.home}%` }} className="bg-emerald-500 transition-all duration-1000"></div>
              <div style={{ width: `${stats.draw}%` }} className="bg-slate-500 transition-all duration-1000"></div>
              <div style={{ width: `${stats.away}%` }} className="bg-blue-500 transition-all duration-1000"></div>
            </div>
          </div>
        )}
      </div>

      {/* Banner INFERIOR */}
      <div className={`mt-4 pt-3 border-t ${isJoker ? 'border-amber-900/50 bg-amber-950/20' : 'border-emerald-900/50 bg-emerald-950/20'} text-center rounded-xl pb-3 border ${isCapturing ? 'block' : 'hidden'}`}>
          <div className={`text-[10px] ${isJoker ? 'text-amber-500' : 'text-emerald-500'} uppercase tracking-widest mb-1 font-bold flex items-center justify-center gap-1`}>
            {isJoker && <Zap className="w-3 h-3" />}
            {isJoker ? 'Mi Pronóstico (Doble Puntos)' : 'Mi Pronóstico Guardado'}
          </div>
      </div>

    </div>
  );
}
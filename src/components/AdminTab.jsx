import React, { useState } from 'react';
import { doc, setDoc, writeBatch, getDocs, collection, query } from 'firebase/firestore'; 
import { Globe2, ShieldAlert, Trash2 } from 'lucide-react'; 
import ReactCountryFlag from 'react-country-flag'; 
import { db, appId } from '../lib/firebase'; 

// 1. EXTRAÍDO FUERA DEL COMPONENTE: No se re-crea en memoria en cada render
const TEAM_MAP = {
  "mexico": { name: "Mexico", code: "MX" },
  "south africa": { name: "South Africa", code: "ZA" },
  "south korea": { name: "South Korea", code: "KR" },
  "czech republic": { name: "Czech Republic", code: "CZ" },
  "canada": { name: "Canada", code: "CA" },
  "bosnia and herzegovina": { name: "Bosnia and Herzegovina", code: "BA" },
  "united states": { name: "United States", code: "US" },
  "paraguay": { name: "Paraguay", code: "PY" },
  "haiti": { name: "Haiti", code: "HT" },
  "scotland": { name: "Scotland", code: "GB-SCT" },
  "australia": { name: "Australia", code: "AU" },
  "turkey": { name: "Turkey", code: "TR" },
  "brazil": { name: "Brazil", code: "BR" },
  "morocco": { name: "Morocco", code: "MA" },
  "qatar": { name: "Qatar", code: "QA" },
  "switzerland": { name: "Switzerland", code: "CH" },
  "ivory coast": { name: "Ivory Coast", code: "CI" },
  "ecuador": { name: "Ecuador", code: "EC" },
  "germany": { name: "Germany", code: "DE" },
  "curaçao": { name: "Curaçao", code: "CW" },
  "netherlands": { name: "Netherlands", code: "NL" },
  "japan": { name: "Japan", code: "JP" },
  "sweden": { name: "Sweden", code: "SE" },
  "tunisia": { name: "Tunisia", code: "TN" },
  "belgium": { name: "Belgium", code: "BE" },
  "egypt": { name: "Egypt", code: "EG" },
  "iran": { name: "Iran", code: "IR" },
  "new zealand": { name: "New Zealand", code: "NZ" },
  "spain": { name: "Spain", code: "ES" },
  "cape verde": { name: "Cape Verde", code: "CV" },
  "saudi arabia": { name: "Saudi Arabia", code: "SA" },
  "uruguay": { name: "Uruguay", code: "UY" },
  "france": { name: "France", code: "FR" },
  "senegal": { name: "Senegal", code: "SN" },
  "iraq": { name: "Iraq", code: "IQ" },
  "norway": { name: "Norway", code: "NO" },
  "algeria": { name: "Algeria", code: "DZ" },
  "austria": { name: "Austria", code: "AT" },
  "jordan": { name: "Jordan", code: "JO" },
  "portugal": { name: "Portugal", code: "PT" },
  "democratic republic of the congo": { name: "DR Congo", code: "CD" },
  "uzbekistan": { name: "Uzbekistan", code: "UZ" },
  "colombia": { name: "Colombia", code: "CO" },
  "panama": { name: "Panama", code: "PA" },
  "croatia": { name: "Croatia", code: "HR" },
  "ghana": { name: "Ghana", code: "GH" },
  "england": { name: "England", code: "GB-ENG" },
  "argentina": { name: "Argentina", code: "AR" }
};

export default function AdminTab({ matches = [] }) {
  const [isSyncing, setIsSyncing] = useState(false);

  // Funciones de utilidad para Chunking (Manejo de límites de Firebase)
  const chunkArray = (arr, size) => 
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );

  const deleteAllMatches = async () => {
    if (!window.confirm("⚠️ ¿ESTÁS SEGURO? Esto borrará TODOS los partidos actuales. Las predicciones de los usuarios no se perderán, pero dejarán de verse hasta que resincronices.")) return;
    
    setIsSyncing(true);
    try {
      const matchCol = collection(db, 'artifacts', appId, 'public', 'data', 'matches');
      const snapshot = await getDocs(query(matchCol));
      
      // Lógica de producción: Firestore solo permite borrar 500 docs por batch
      const chunks = chunkArray(snapshot.docs, 450);
      for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach((docSnap) => batch.delete(docSnap.ref));
        await batch.commit();
      }
      
      alert("✅ Limpieza completa. Base de datos purgada.");
    } catch (e) {
      console.error("Error borrando:", e);
      alert("Error borrando: " + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncFixturesFromAPI = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/get/games`);
      const json = await res.json();
      const dataList = json.data || json.games || json;

      const batch = writeBatch(db);

      dataList.forEach((m) => {
        const matchId = (m.id || m._id || "").toString();
        if (!matchId) return;

        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'matches', matchId);

        // --- NORMALIZACIÓN PROFESIONAL DE FECHA ---
        // JS Date detecta automáticamente si el string tiene offset (como Z o -05:00)
        // y lo convierte a un momento absoluto en el tiempo.
        let parsedDate = new Date(m.date || m.utc_date || m.local_date);
        
        // Si la fecha es inválida (ej: formato raro), intentamos con el timestamp
        if (isNaN(parsedDate.getTime())) {
             parsedDate = new Date(m.timestamp * 1000);
        }

        const matchData = {
          id: matchId,
          order: m.matchday || 1,
          group: m.group ? `GRUPO ${m.group}` : "FASE FINAL",
          // GUARDAMOS SIEMPRE EN ISO (UTC). 
          // El frontend luego se encarga de mostrarlo en "hora Argentina" usando toLocaleString
          date: parsedDate.toISOString(), 
          rawDate: m.local_date || "Fecha por definir",
          home: (TEAM_MAP[m.home_team_name_en?.toLowerCase()]?.name) || m.home_team_name_en || "Local",
          away: (TEAM_MAP[m.away_team_name_en?.toLowerCase()]?.name) || m.away_team_name_en || "Visitante",
          flagH: (TEAM_MAP[m.home_team_name_en?.toLowerCase()]?.code) || "UN",
          flagA: (TEAM_MAP[m.away_team_name_en?.toLowerCase()]?.code) || "UN",
          status: (m.finished === 'TRUE' || m.finished === true || m.time_elapsed === 'finished') ? 'finished' : 'pending',
          realHomeScore: parseInt(m.home_score, 10) || 0,
          realAwayScore: parseInt(m.away_score, 10) || 0
        };

        batch.set(docRef, matchData, { merge: true });
      });

      await batch.commit();
      alert("✅ Fixture sincronizado con fechas normalizadas a UTC.");
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAdminScore = async (matchId, type, val) => {
    const numericVal = parseInt(val, 10);
    if (isNaN(numericVal)) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'matches', matchId);
      await setDoc(docRef, { [type]: numericVal }, { merge: true });
    } catch (e) { console.error("Error guardando score manual", e); }
  };

  const toggleMatchStatus = async (match) => {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'matches', match.id);
      await setDoc(docRef, { 
        status: match.status === 'pending' ? 'finished' : 'pending' 
      }, { merge: true });
    } catch (e) { console.error("Error cambiando estado", e); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={syncFixturesFromAPI} 
          disabled={isSyncing} 
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSyncing ? 'Sincronizando con API...' : '⬇️ Sincronizar Fixture / Resultados'}
        </button>
        <button 
          onClick={deleteAllMatches} 
          disabled={isSyncing}
          title="Eliminar todos los partidos de la base de datos"
          className="bg-slate-800 text-red-400 px-6 py-3 rounded-xl border border-red-900/50 hover:bg-red-900/40 hover:text-red-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Trash2 className="w-5 h-5" /> 
          <span className="sm:hidden">Limpiar BD</span>
        </button>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-yellow-500" /> Carga Manual (Respaldo)
        </h3>
        
        <div className="space-y-3">
          {matches.map(match => (
            <div key={match.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="font-bold text-emerald-400 text-sm md:w-1/3">
                {match.group} 
                <span className="text-slate-500 flex items-center gap-2 text-xs mt-1">
                  <ReactCountryFlag countryCode={match.flagH} svg style={{ width: '1.2em', height: '1.2em', borderRadius: '2px' }}/> 
                  {match.home} vs {match.away} 
                  <ReactCountryFlag countryCode={match.flagA} svg style={{ width: '1.2em', height: '1.2em', borderRadius: '2px' }}/>
                </span>
              </div>
              
              <div className="flex items-center gap-2 justify-center w-full md:w-1/3">
                <input 
                  type="number" 
                  value={match.realHomeScore ?? ''}
                  onChange={(e) => handleAdminScore(match.id, 'realHomeScore', e.target.value)}
                  className="w-14 h-10 bg-slate-900 border border-slate-700 rounded text-center font-bold text-white focus:border-emerald-500 outline-none transition-colors"
                />
                <span className="text-slate-600">-</span>
                <input 
                  type="number" 
                  value={match.realAwayScore ?? ''}
                  onChange={(e) => handleAdminScore(match.id, 'realAwayScore', e.target.value)}
                  className="w-14 h-10 bg-slate-900 border border-slate-700 rounded text-center font-bold text-white focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              <div className="w-full md:w-1/3 flex justify-end">
                <button 
                  onClick={() => toggleMatchStatus(match)}
                  className={`py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-wider w-full md:w-auto transition-colors ${
                    match.status === 'finished' 
                      ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  {match.status === 'finished' ? 'Reabrir' : 'Finalizar'}
                </button>
              </div>
            </div>
          ))}
          {matches.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No hay partidos en la base de datos.</p>}
        </div>
      </div>
    </div>
  );
}
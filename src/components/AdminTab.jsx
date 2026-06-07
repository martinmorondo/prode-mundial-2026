import React, { useState } from 'react';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { Globe2, ShieldAlert } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag'; // <-- 1. Importamos la librería
import { db, appId } from '../lib/firebase'; 

export default function AdminTab({ matches = [] }) {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncFixturesFromAPI = async () => {
    setIsSyncing(true);

    // 2. Cambiamos 'flag' por 'code' con los códigos ISO oficiales
    const teamMap = {
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

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/get/games`);
      const json = await res.json();
      const dataList = json.data || json.games || json;

      if (!Array.isArray(dataList)) throw new Error("Error en el formato de API");

      const batch = writeBatch(db);

      dataList.forEach((m, index) => {
        const matchId = m._id || m.id?.toString() || `m${index}`;
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'matches', matchId);

        const homeNameRaw = (m.home_team_name_en || "").trim().toLowerCase();
        const awayNameRaw = (m.away_team_name_en || "").trim().toLowerCase();

        // 3. Si no encuentra el país, usamos 'UN' (United Nations) como fallback visual
        const homeData = teamMap[homeNameRaw] || { name: m.home_team_name_en || m.home_team_label || "Local", code: "UN" };
        const awayData = teamMap[awayNameRaw] || { name: m.away_team_name_en || m.away_team_label || "Visitante", code: "UN" };

        const matchData = {
          id: matchId,
          order: index + 1,
          group: m.group ? `GRUPO ${m.group}` : "FASE FINAL",
          date: m.local_date || "Fecha por definir",
          home: homeData.name,
          away: awayData.name,
          flagH: homeData.code, // <-- Pasamos el código a Firebase
          flagA: awayData.code, // <-- Pasamos el código a Firebase
          status: (m.finished === 'TRUE' || m.finished === true || m.time_elapsed === 'finished') ? 'finished' : 'pending',
          realHomeScore: parseInt(m.home_score, 10) || 0,
          realAwayScore: parseInt(m.away_score, 10) || 0
        };

        batch.set(docRef, matchData, { merge: false });
      });

      await batch.commit();
      alert("✅ ¡Sincronización completa con los 48 equipos!");
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAdminScore = async (matchId, type, val) => {
    const numericVal = parseInt(val, 10);
    if(isNaN(numericVal)) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'matches', matchId), {
        [type]: numericVal
      }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  const toggleMatchStatus = async (match) => {
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'matches', match.id), {
        status: match.status === 'pending' ? 'finished' : 'pending'
      }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 slide-in-from-bottom-4">
      <div className="bg-slate-900 p-6 rounded-2xl border border-purple-500/30 shadow-lg">
        <div className="flex items-start gap-4 flex-col sm:flex-row">
          <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400 shrink-0">
            <Globe2 className="w-6 h-6" />
          </div>
          <div className="w-full">
            <h3 className="text-xl font-bold text-white mb-2">Sincronización de Datos</h3>
            <p className="text-sm text-slate-400 mb-6">
              Actualiza el fixture y los resultados desde el servidor central.
            </p>
            <button 
              onClick={syncFixturesFromAPI}
              disabled={isSyncing}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isSyncing ? 'Sincronizando...' : '⬇️ Sincronizar Fixture / Resultados'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-yellow-500" /> Carga Manual (Respaldo)
        </h3>
        <p className="text-sm text-slate-400 mb-6">Si la API falla, puedes actualizar resultados a mano.</p>
        
        <div className="space-y-3">
          {matches.map(match => (
            <div key={match.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="font-bold text-emerald-400 text-sm md:w-1/3">
                {match.group} 
                <span className="text-slate-500 flex items-center gap-2 text-xs mt-1">
                  {/* 4. Aplicamos las banderas visuales en el panel admin */}
                  <ReactCountryFlag countryCode={match.flagH} svg style={{ width: '1.2em', height: '1.2em', borderRadius: '2px' }}/> 
                  {match.home} vs {match.away} 
                  <ReactCountryFlag countryCode={match.flagA} svg style={{ width: '1.2em', height: '1.2em', borderRadius: '2px' }}/>
                </span>
              </div>
              
              <div className="flex items-center gap-2 justify-center w-full md:w-1/3">
                <input 
                  type="number" 
                  value={match.realHomeScore}
                  onChange={(e) => handleAdminScore(match.id, 'realHomeScore', e.target.value)}
                  className="w-14 h-10 bg-slate-900 border border-slate-700 rounded text-center font-bold text-white focus:border-emerald-500 outline-none"
                />
                <span className="text-slate-600">-</span>
                <input 
                  type="number" 
                  value={match.realAwayScore}
                  onChange={(e) => handleAdminScore(match.id, 'realAwayScore', e.target.value)}
                  className="w-14 h-10 bg-slate-900 border border-slate-700 rounded text-center font-bold text-white focus:border-emerald-500 outline-none"
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
          {matches.length === 0 && <p className="text-slate-500 text-sm text-center">No hay partidos cargados.</p>}
        </div>
      </div>
    </div>
  );
}
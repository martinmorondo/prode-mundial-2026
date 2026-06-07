import React, { useState } from 'react';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { Globe2, ShieldAlert } from 'lucide-react';
import { db, appId } from '../lib/firebase'; 

export default function AdminTab({ matches = [] }) {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncFixturesFromAPI = async () => {
    setIsSyncing(true);

    const teamMap = {
      "mexico": { name: "Mexico", flag: "🇲🇽" },
      "south africa": { name: "South Africa", flag: "🇿🇦" },
      "south korea": { name: "South Korea", flag: "🇰🇷" },
      "czech republic": { name: "Czech Republic", flag: "🇨🇿" },
      "canada": { name: "Canada", flag: "🇨🇦" },
      "bosnia and herzegovina": { name: "Bosnia and Herzegovina", flag: "🇧🇦" },
      "united states": { name: "United States", flag: "🇺🇸" },
      "paraguay": { name: "Paraguay", flag: "🇵🇾" },
      "haiti": { name: "Haiti", flag: "🇭🇹" },
      "scotland": { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
      "australia": { name: "Australia", flag: "🇦🇺" },
      "turkey": { name: "Turkey", flag: "🇹🇷" },
      "brazil": { name: "Brazil", flag: "🇧🇷" },
      "morocco": { name: "Morocco", flag: "🇲🇦" },
      "qatar": { name: "Qatar", flag: "🇶🇦" },
      "switzerland": { name: "Switzerland", flag: "🇨🇭" },
      "ivory coast": { name: "Ivory Coast", flag: "🇨🇮" },
      "ecuador": { name: "Ecuador", flag: "🇪🇨" },
      "germany": { name: "Germany", flag: "🇩🇪" },
      "curaçao": { name: "Curaçao", flag: "🇨🇼" },
      "netherlands": { name: "Netherlands", flag: "🇳🇱" },
      "japan": { name: "Japan", flag: "🇯🇵" },
      "sweden": { name: "Sweden", flag: "🇸🇪" },
      "tunisia": { name: "Tunisia", flag: "🇹🇳" },
      "belgium": { name: "Belgium", flag: "🇧🇪" },
      "egypt": { name: "Egypt", flag: "🇪🇬" },
      "iran": { name: "Iran", flag: "🇮🇷" },
      "new zealand": { name: "New Zealand", flag: "🇳🇿" },
      "spain": { name: "Spain", flag: "🇪🇸" },
      "cape verde": { name: "Cape Verde", flag: "🇨🇻" },
      "saudi arabia": { name: "Saudi Arabia", flag: "🇸🇦" },
      "uruguay": { name: "Uruguay", flag: "🇺🇾" },
      "france": { name: "France", flag: "🇫🇷" },
      "senegal": { name: "Senegal", flag: "🇸🇳" },
      "iraq": { name: "Iraq", flag: "🇮🇶" },
      "norway": { name: "Norway", flag: "🇳🇴" },
      "algeria": { name: "Algeria", flag: "🇩🇿" },
      "austria": { name: "Austria", flag: "🇦🇹" },
      "jordan": { name: "Jordan", flag: "🇯🇴" },
      "portugal": { name: "Portugal", flag: "🇵🇹" },
      "democratic republic of the congo": { name: "DR Congo", flag: "🇨🇩" },
      "uzbekistan": { name: "Uzbekistan", flag: "🇺🇿" },
      "colombia": { name: "Colombia", flag: "🇨🇴" },
      "panama": { name: "Panama", flag: "🇵🇦" },
      "croatia": { name: "Croatia", flag: "🇭🇷" },
      "ghana": { name: "Ghana", flag: "🇬🇭" },
      "england": { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      "argentina": { name: "Argentina", flag: "🇦🇷" }
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

        const homeData = teamMap[homeNameRaw] || { name: m.home_team_name_en || m.home_team_label || "Local", flag: "⚽" };
        const awayData = teamMap[awayNameRaw] || { name: m.away_team_name_en || m.away_team_label || "Visitante", flag: "⚽" };

        const matchData = {
          id: matchId,
          order: index + 1,
          group: m.group ? `GRUPO ${m.group}` : "FASE FINAL",
          date: m.local_date || "Fecha por definir",
          home: homeData.name,
          away: awayData.name,
          flagH: homeData.flag,
          flagA: awayData.flag,
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
console.log("Datos de matches recibidos:", matches);
  return (
    <div className="space-y-6 animate-in fade-in duration-300 slide-in-from-bottom-4">
      {/* Caja de Sincronización */}
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

      {/* Caja de Carga Manual */}
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
                <span className="text-slate-500 block text-xs">
                  {match.flagH} {match.home} vs {match.away} {match.flagA}
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
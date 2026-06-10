import { useState, useEffect } from 'react';

// Lista de equipos principales para facilitar la elección (puedes editarla)
const EQUIPOS = [
  "Alemania", "Arabia Saudita", "Argelia", "Argentina", "Australia", 
  "Austria", "Bélgica", "Bosnia-Herzegovina", "Brasil", "Cabo Verde", 
  "Canadá", "Chequia", "Colombia", "Corea del Sur", "Costa de Marfil", 
  "Croacia", "Curazao", "DR Congo", "Ecuador", "Egipto", "Escocia", 
  "España", "Estados Unidos", "Francia", "Ghana", "Haití", "Inglaterra", 
  "Irak", "Irán", "Japón", "Jordania", "Marruecos", "México", "Noruega", 
  "Nueva Zelanda", "Países Bajos", "Panamá", "Paraguay", "Portugal", 
  "Qatar", "Senegal", "Sudáfrica", "Suecia", "Suiza", "Túnez", 
  "Turquía", "Uruguay", "Uzbekistán"
].sort();

// FECHA LÍMITE (Ejemplo: 11 de Junio de 2026, inicio del Mundial)
const START_DATE = new Date('2026-06-11T19:00:00Z');

export function CandidatesTab({ myBonusPred, saveBonusPrediction }) {
  const [formData, setFormData] = useState({ champion: '', topScorer: '', bestPlayer: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Verificamos si el mundial ya empezó para bloquear edición
  const isLocked = new Date() > START_DATE;

  useEffect(() => {
    if (myBonusPred) {
      setFormData({
        champion: myBonusPred.champion || '',
        topScorer: myBonusPred.topScorer || '',
        bestPlayer: myBonusPred.bestPlayer || ''
      });
    }
  }, [myBonusPred]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;
    
    setIsSaving(true);
    const success = await saveBonusPrediction(formData.champion, formData.topScorer, formData.bestPlayer);
    setIsSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000); // Ocultar mensaje de éxito tras 3 seg
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🏆 Pronósticos Especiales
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Adiviná estos resultados para sumar puntos extra al final del Mundial.
        </p>
        {isLocked && (
          <p className="mt-2 text-sm text-red-400 bg-red-900/20 p-2 rounded">
            🔒 El Mundial ya empezó. Ya no se pueden editar los candidatos.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* CAMPEÓN */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            País Campeón (+10 pts)
          </label>
          <select
            name="champion"
            value={formData.champion}
            onChange={handleChange}
            disabled={isLocked}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            <option value="">-- Seleccioná un país --</option>
            {EQUIPOS.map(equipo => (
              <option key={equipo} value={equipo}>{equipo}</option>
            ))}
          </select>
        </div>

        {/* GOLEADOR */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Goleador del Torneo (+5 pts)
          </label>
          <input
            type="text"
            name="topScorer"
            placeholder="Ej: Kylian Mbappé"
            value={formData.topScorer}
            onChange={handleChange}
            disabled={isLocked}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
        </div>

        {/* FIGURA */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Mejor Jugador / Figura (+5 pts)
          </label>
          <input
            type="text"
            name="bestPlayer"
            placeholder="Ej: Lionel Messi"
            value={formData.bestPlayer}
            onChange={handleChange}
            disabled={isLocked}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
        </div>

        {/* BOTÓN GUARDAR */}
        {!isLocked && (
          <button
            type="submit"
            disabled={isSaving || isLocked}
            className={`w-full font-bold py-3 rounded-lg transition-colors ${
                isLocked ? 'bg-slate-700 text-slate-400 cursor-not-allowed' :
                saved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
            >
            {isSaving ? 'Guardando...' : saved ? '¡Guardado! (Podés editarlo)' : 'Guardar Candidatos'}
            </button>
        )}
      </form>
    </div>
  );
}
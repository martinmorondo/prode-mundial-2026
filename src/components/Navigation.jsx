import React from 'react';
import { Calendar, Activity, Settings, Medal } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, user }) {
  
  const tabs = [
    { id: 'fixture', icon: Calendar, label: 'Pronósticos' },
    { id: 'ranking', icon: Activity, label: 'Tabla' },
    // 2. Agregamos la nueva pestaña aquí
    { id: 'candidatos', icon: Medal, label: 'Candidatos' },
    // El filtro para admin sigue igual
    user?.uid === 'fOz55g8nrCYI8onReC60p8SMX1S2' && { id: 'admin', icon: Settings, label: 'Admin' }
  ].filter(Boolean);

  return (
    <div className="flex bg-slate-900 p-1 rounded-xl mb-6 shadow-lg border border-slate-800">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg font-bold text-xs transition-all ${
              isActive 
                ? 'bg-slate-700 text-white shadow-md border border-slate-600' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
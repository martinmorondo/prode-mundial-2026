import React from 'react';
import { Calendar, Activity, Settings } from 'lucide-react';

// 1. Agregamos 'user' a los props
export default function Navigation({ activeTab, setActiveTab, user }) {
  
  // 2. Filtramos los tabs: mostramos 'admin' solo si el UID coincide
  const tabs = [
    { id: 'fixture', icon: Calendar, label: 'Pronósticos' },
    { id: 'ranking', icon: Activity, label: 'Tabla General' },
    user?.uid === '2Tj8HHXMcYQXljBKBEI4UV9Wmnr1' && { id: 'admin', icon: Settings, label: 'Admin' }
  ].filter(Boolean); // .filter(Boolean) elimina el 'false' si el usuario no es admin

  return (
    <div className="flex bg-slate-900 p-1 rounded-xl mb-6 shadow-lg border border-slate-800">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${
              isActive 
                ? tab.id === 'admin' 
                  ? 'bg-slate-700 text-white shadow-md border border-slate-600' 
                  : 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Icon className="w-4 h-4" /> 
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
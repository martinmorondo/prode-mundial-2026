import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { 
  Trophy, Calendar, CheckCircle, Activity, Settings, 
  Globe2, Medal, LogIn 
} from 'lucide-react';

import { db, appId } from './lib/firebase';
import { useAuth } from './hooks/useAuth';
import { useProdeData } from './hooks/useProdeData';
import Navigation from './components/Navigation';
import Header from './components/Header';
import AdminTab from './components/AdminTab';
import FixtureTab from './components/FixtureTab';
import LoginScreen from './components/LoginScreen'; 
import RankingTab from './components/RankingTab';
import { CandidatesTab } from './components/CandidatesTab';

// --- COMPONENTE PRINCIPAL (ORQUESTADOR) ---
export default function ProdeLaRondaApp() {
  const { user, userProfile, setUserProfile, loginWithEmail, registerWithEmail, loadingAuth } = useAuth();
  const { matches, myPredictions, setMyPredictions, ranking, loadingDb, myBonusPred, saveBonusPrediction } = useProdeData(user);
  
  const [activeTab, setActiveTab] = useState('fixture');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleAuthAction = async (authData) => {
    setIsSavingProfile(true);
    try {
      if (authData.type === 'register') {
        // 1. Crear usuario en Firebase Auth
        const credential = await registerWithEmail(authData.email, authData.password);
        // 2. Guardar perfil en Firestore vinculado a ese UID para siempre
        const userData = { 
          uid: credential.user.uid, 
          name: authData.name, 
          avatar: authData.avatar, 
          createdAt: new Date().toISOString() 
        };
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', credential.user.uid), userData);
        setUserProfile(userData);
      } else {
        // Iniciar sesión tradicional
        await loginWithEmail(authData.email, authData.password);
      }
    } catch (e) {
      alert("Error de autenticación: " + e.message);
    }
    setIsSavingProfile(false);
  };

  const handlePredictionChange = (matchId, field, value) => {
    setMyPredictions(prev => {
      // Si el campo es el comodín, guardamos el true/false directamente sin convertirlo a número
      if (field === 'isJoker') {
        return {
          ...prev, 
          [matchId]: { ...prev[matchId], [field]: value }
        };
      }
      
      // Si son los goles, mantenemos la lógica anterior de convertir a número entero
      const val = parseInt(value, 10);
      return {
        ...prev, 
        [matchId]: { ...prev[matchId], [field]: isNaN(val) ? '' : val }
      };
    });
  };

  const savePrediction = async (matchId) => {
    // --- Validar tiempo antes de guardar ---
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    if (match.status === 'finished') {
      alert("¡Este partido ya finalizó!");
      return;
    }

    if (match.date && !match.date.toLowerCase().includes('definir')) {
      try {
        const [datePart, timePart] = match.date.split(' ');
        if (datePart && timePart) {
          const [d, m, y] = datePart.split('/');
          const [h, min] = timePart.split(':');
          
          // Parseamos como UTC
          const matchDate = new Date(Date.UTC(y, m - 1, d, h, min));
          
          // Bloqueamos 1 hora antes (currentTime >= matchDate - 1h)
          const cutoffTime = new Date(matchDate.getTime() - (60 * 60 * 1000));
          
          if (new Date() >= cutoffTime) {
            alert("¡El tiempo para pronosticar este partido ha finalizado!");
            return;
          }
        }
      } catch (e) {
        console.warn("Error en validación de tiempo:", e);
      }
    }

    const pred = myPredictions[matchId];
    if (!pred || pred.homeScore === '' || pred.awayScore === '') return;
    try {
      const predId = `${user.uid}_${matchId}`;
      const payload = {
        userId: user.uid, 
        matchId, 
        homeScore: parseInt(pred.homeScore, 10), 
        awayScore: parseInt(pred.awayScore, 10), 
        isJoker: !!pred.isJoker,  
        timestamp: new Date().toISOString()
      };
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'predictions', predId), payload);
    } catch (e) {
      console.error("Error", e);
    }
  };

  // --- CONTROL DE PANTALLAS DE CARGA ---
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400 font-mono">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Globe2 className="w-10 h-10" /><span>Comprobando sesión...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onAuthAction={handleAuthAction} isSaving={isSavingProfile} />;
  }
  
  // console.log("Estado actual:", { loadingDb, userProfile, user });
  
  if (loadingDb || !userProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400 font-mono">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Globe2 className="w-10 h-10" /><span>Cargando fixture de La Ronda...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 selection:bg-emerald-500/30">
      <Header userProfile={userProfile} />
      <main className="max-w-4xl mx-auto p-4 mt-4">
        <Navigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          user={user} 
        />
        
        {/* Pestañas corregidas y sin duplicar */}
        {activeTab === 'fixture' && (
          <FixtureTab matches={matches} myPredictions={myPredictions} handlePredictionChange={handlePredictionChange} savePrediction={savePrediction} />
        )}
        
        {activeTab === 'ranking' && (
          <RankingTab ranking={ranking} currentUserUid={user.uid} />
        )}

        {activeTab === 'candidatos' && (
          <CandidatesTab 
            myBonusPred={myBonusPred} 
            saveBonusPrediction={saveBonusPrediction} 
          />
        )}
        
        {activeTab === 'admin' && user.uid === 'fOz55g8nrCYI8onReC60p8SMX1S2' && (
          <AdminTab matches={matches} />
        )}
        
        {activeTab === 'admin' && user.uid !== 'fOz55g8nrCYI8onReC60p8SMX1S2' && (
          <div className="text-center p-10 text-slate-500">
            🚫 Acceso denegado. Solo para administradores.
          </div>
        )}
      </main>
    </div>
  );
}
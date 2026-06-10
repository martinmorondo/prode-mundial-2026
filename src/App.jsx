import React, { useState, useEffect } from 'react';
import logoRondero from '../public/logo-rondero.png'; 
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
import PointsNotification from './components/PointsNotification';
import ProfileTab from './components/ProfileTab'; 

export default function ProdeLaRondaApp() {
  const { user, userProfile, setUserProfile, loginWithEmail, registerWithEmail, loadingAuth } = useAuth();
  const { matches, myPredictions, setMyPredictions, ranking, loadingDb, myBonusPred, saveBonusPrediction } = useProdeData(user);
  
  const [activeTab, setActiveTab] = useState('perfil'); 
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const [gainedPoints, setGainedPoints] = useState(0);

  useEffect(() => {
    if (!user || !ranking.length) return;

    const currentUserRanking = ranking.find(r => r.uid === user.uid);
    if (!currentUserRanking) return;

    const currentPoints = currentUserRanking.points;
    const storageKey = `prode_last_points_${user.uid}`;
    const lastPointsStr = localStorage.getItem(storageKey);

    if (lastPointsStr === null) {
      localStorage.setItem(storageKey, currentPoints.toString());
    } else {
      const lastPoints = parseInt(lastPointsStr, 10);
      if (currentPoints > lastPoints) {
        setGainedPoints(currentPoints - lastPoints);
      } else if (currentPoints < lastPoints) {
        localStorage.setItem(storageKey, currentPoints.toString());
      }
    }
  }, [user, ranking]);

  const handleCloseNotification = () => {
    const currentUserRanking = ranking.find(r => r.uid === user?.uid);
    if (currentUserRanking) {
      localStorage.setItem(`prode_last_points_${user.uid}`, currentUserRanking.points.toString());
    }
    setGainedPoints(0);
  };

  const handleAuthAction = async (authData) => {
    setIsSavingProfile(true);
    try {
      if (authData.type === 'register') {
        const credential = await registerWithEmail(authData.email, authData.password);
        const userData = { 
          uid: credential.user.uid, 
          name: authData.name, 
          avatar: authData.avatar, 
          createdAt: new Date().toISOString() 
        };
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', credential.user.uid), userData);
        setUserProfile(userData);
      } else {
        await loginWithEmail(authData.email, authData.password);
      }
    } catch (e) {
      alert("Error de autenticación: " + e.message);
    }
    setIsSavingProfile(false);
  };

  const handlePredictionChange = (matchId, field, value) => {
    setMyPredictions(prev => {
      if (field === 'isJoker') {
        return { ...prev, [matchId]: { ...prev[matchId], [field]: value } };
      }
      const val = parseInt(value, 10);
      return { ...prev, [matchId]: { ...prev[matchId], [field]: isNaN(val) ? '' : val } };
    });
  };

  const savePrediction = async (matchId) => {
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
          
          const matchDate = new Date(Date.UTC(y, m - 1, d, h, min));
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

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Fondo con brillo sutil */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Contenedor del Logo con anillos animados */}
          <div className="relative flex items-center justify-center w-28 h-28 mb-6">
            {/* Anillo exterior rápido */}
            <div className="absolute inset-0 border-t-2 border-r-2 border-emerald-500 rounded-full animate-spin"></div>
            {/* Anillo interior lento y en reversa */}
            <div className="absolute inset-2 border-b-2 border-l-2 border-emerald-400/30 rounded-full animate-[spin_3s_linear_reverse]"></div>
            
            {/* TU LOGO */}
            <img 
              src="/logo-rondero.png" 
              alt="La Ronda" 
              className="w-16 h-16 object-contain animate-pulse drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
            />
          </div>

          {/* Texto estilizado */}
          <h2 className="text-emerald-400 font-black tracking-widest uppercase text-sm animate-pulse">
            Comprobando sesión...
          </h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onAuthAction={handleAuthAction} isSaving={isSavingProfile} />;
  }
  
  if (loadingDb || !userProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Fondo con brillo sutil */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Contenedor del Logo con anillos animados */}
          <div className="relative flex items-center justify-center w-28 h-28 mb-6">
            {/* Anillo exterior rápido */}
            <div className="absolute inset-0 border-t-2 border-r-2 border-emerald-500 rounded-full animate-spin"></div>
            {/* Anillo interior lento y en reversa */}
            <div className="absolute inset-2 border-b-2 border-l-2 border-emerald-400/30 rounded-full animate-[spin_3s_linear_reverse]"></div>
            
            <img 
              src="/logo-rondero.png" 
              alt="La Ronda" 
              className="w-16 h-16 object-contain animate-pulse drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
            />
          </div>

          {/* Texto estilizado */}
          <h2 className="text-emerald-400 font-black tracking-widest uppercase text-sm animate-pulse">
            Cargando fixture de La Ronda...
          </h2>
        </div>
      </div>
    );
  }

  // Extraemos la información del ranking para el usuario actual
  const currentUserRanking = ranking.find(r => r.uid === user.uid);
  const currentUserPosition = ranking.findIndex(r => r.uid === user.uid) + 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 selection:bg-emerald-500/30 relative overflow-x-hidden">
      <Header userProfile={userProfile} />
      <main className="max-w-4xl mx-auto p-4 mt-4 relative">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
        
        {/* NUEVA PESTAÑA DE PERFIL */}
        {activeTab === 'perfil' && (
          <ProfileTab 
            userProfile={userProfile} 
            userRanking={currentUserRanking} 
            position={currentUserPosition} 
            totalUsers={ranking.length}
          />
        )}

        {activeTab === 'fixture' && (
          <FixtureTab matches={matches} myPredictions={myPredictions} handlePredictionChange={handlePredictionChange} savePrediction={savePrediction} />
        )}
        
        {activeTab === 'ranking' && (
          <RankingTab ranking={ranking} currentUserUid={user.uid} />
        )}

        {activeTab === 'candidatos' && (
          <CandidatesTab myBonusPred={myBonusPred} saveBonusPrediction={saveBonusPrediction} />
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

      <PointsNotification 
        points={gainedPoints} 
        onClose={handleCloseNotification} 
      />
    </div>
  );
}
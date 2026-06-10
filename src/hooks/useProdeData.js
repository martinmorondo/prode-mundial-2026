import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, setDoc, doc } from 'firebase/firestore';
import { db, getPublicCollection } from '../lib/firebase';

// Helper de cálculo de puntos
const calculateMatchPoints = (predHome, predAway, realHome, realAway) => {
  if (predHome === undefined || predAway === undefined || realHome === undefined || realAway === undefined) return 0;
  if (predHome === '' || predAway === '' || realHome === '' || realAway === '') return 0;

  const ph = parseInt(predHome, 10), pa = parseInt(predAway, 10);
  const rh = parseInt(realHome, 10), ra = parseInt(realAway, 10);
  if (isNaN(ph) || isNaN(pa) || isNaN(rh) || isNaN(ra)) return 0;
  if (ph === rh && pa === ra) return 3; 
  
  const predTrend = (ph - pa) > 0 ? 'home' : (ph - pa) < 0 ? 'away' : 'draw';
  const realTrend = (rh - ra) > 0 ? 'home' : (rh - ra) < 0 ? 'away' : 'draw';
  if (predTrend === realTrend) return 1; 
  return 0; 
};

// Helper para parsear la fecha y ordenar los partidos cronológicamente
const parseDateForSort = (dStr) => {
  if (!dStr || dStr.includes('definir')) return 0;
  try {
    const [datePart, timePart] = dStr.split(' ');
    const [d, m, y] = datePart.split('/');
    const [h, min] = timePart.split(':');
    return new Date(y, m - 1, d, h, min).getTime();
  } catch (e) {
    return 0;
  }
};

const BONUS_POINTS = { CHAMPION: 10, SCORER: 5, PLAYER: 5 };

export function useProdeData(user) {
  const [usersDb, setUsersDb] = useState({});
  const [matches, setMatches] = useState([]);
  const [allPredictions, setAllPredictions] = useState([]);
  const [myPredictions, setMyPredictions] = useState({});
  const [allBonusPreds, setAllBonusPreds] = useState({}); 
  const [myBonusPred, setMyBonusPred] = useState({ champion: '', topScorer: '', bestPlayer: '' });
  const [tournamentResults, setTournamentResults] = useState({}); 
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubUsers = onSnapshot(getPublicCollection('users'), (snap) => {
      const uDict = {};
      snap.forEach(d => uDict[d.id] = d.data());
      setUsersDb(uDict);
    });
    const unsubMatches = onSnapshot(getPublicCollection('matches'), (snap) => {
      const m = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      m.sort((a, b) => (a.order || 0) - (b.order || 0));
      setMatches(m);
    });
    const unsubPreds = onSnapshot(getPublicCollection('predictions'), (snap) => {
      const p = [];
      const myP = {};
      snap.forEach(d => {
        const data = d.data();
        p.push(data);
        if (data.userId === user.uid) myP[data.matchId] = data;
      });
      setAllPredictions(p);
      setMyPredictions(myP);
    });
    const unsubBonus = onSnapshot(getPublicCollection('bonus_predictions'), (snap) => {
      const b = {};
      snap.forEach(d => {
        const data = d.data();
        b[d.id] = data; 
        if (d.id === user.uid) setMyBonusPred(data);
      });
      setAllBonusPreds(b);
      setLoadingDb(false);
    });
    const unsubResults = onSnapshot(doc(getPublicCollection('settings'), 'bonus_results'), (docSnap) => {
      if (docSnap.exists()) setTournamentResults(docSnap.data());
    });
    return () => { unsubUsers(); unsubMatches(); unsubPreds(); unsubBonus(); unsubResults(); };
  }, [user]);

  // 1. CALCULAMOS PRIMERO EL TERMÓMETRO (Para saber la opinión de la mayoría)
  const matchStats = useMemo(() => {
    const stats = {};
    allPredictions.forEach(pred => {
      if (!stats[pred.matchId]) {
        stats[pred.matchId] = { home: 0, draw: 0, away: 0, total: 0 };
      }
      const home = parseInt(pred.homeScore, 10);
      const away = parseInt(pred.awayScore, 10);
      if (!isNaN(home) && !isNaN(away)) {
        const diff = home - away;
        if (diff > 0) stats[pred.matchId].home += 1;
        else if (diff < 0) stats[pred.matchId].away += 1;
        else stats[pred.matchId].draw += 1;
        stats[pred.matchId].total += 1;
      }
    });

    const statsWithPercentages = {};
    Object.keys(stats).forEach(matchId => {
      const s = stats[matchId];
      if (s.total > 0) {
        statsWithPercentages[matchId] = {
          home: Math.round((s.home / s.total) * 100),
          draw: Math.round((s.draw / s.total) * 100),
          away: Math.round((s.away / s.total) * 100),
          total: s.total
        };
      }
    });
    return statsWithPercentages;
  }, [allPredictions]);

  // 2. LUEGO CALCULAMOS EL RANKING Y LAS MEDALLAS
  const ranking = useMemo(() => {
    if (!matches.length || !Object.keys(usersDb).length) return [];
    
    // Inicializamos a los usuarios con los nuevos contadores
    const scores = Object.keys(usersDb).reduce((acc, uid) => {
      acc[uid] = { ...usersDb[uid], points: 0, exact: 0, trends: 0, bonusPoints: 0, currentStreak: 0, giantKiller: 0 };
      return acc;
    }, {});

    const finishedMatches = matches.filter(m => m.status === 'finished');
    
    // Función para saber qué votó la mayoría en un partido
    const getCommunityTrend = (stats) => {
      if (!stats) return null;
      if (stats.home > stats.away && stats.home > stats.draw) return 'home';
      if (stats.away > stats.home && stats.away > stats.draw) return 'away';
      if (stats.draw > stats.home && stats.draw > stats.away) return 'draw';
      return null;
    };

    // Estructuramos las predicciones por usuario para facilitar la búsqueda
    const predsByUser = {};
    allPredictions.forEach(p => {
      if (!predsByUser[p.userId]) predsByUser[p.userId] = {};
      predsByUser[p.userId][p.matchId] = p;
    });

    // A. Sumar puntos generales y buscar Batacazos
    allPredictions.forEach(pred => {
      const match = finishedMatches.find(m => m.id === pred.matchId);
      if (!match || !scores[pred.userId]) return;

      const basePts = calculateMatchPoints(pred.homeScore, pred.awayScore, match.realHomeScore, match.realAwayScore);
      const finalPts = pred.isJoker ? basePts * 2 : basePts;

      scores[pred.userId].points += finalPts;
      if (basePts === 3) scores[pred.userId].exact += 1;
      if (basePts === 1) scores[pred.userId].trends += 1;

      // LÓGICA CAZAGIGANTES: Si acertó, pero la comunidad votó distinto
      if (basePts > 0) {
         const mStats = matchStats[match.id];
         const communityTrend = getCommunityTrend(mStats);
         const realTrend = (match.realHomeScore - match.realAwayScore) > 0 ? 'home' : (match.realHomeScore - match.realAwayScore) < 0 ? 'away' : 'draw';
         
         // Si la comunidad erró la tendencia, y el usuario la pegó
         if (communityTrend && communityTrend !== realTrend) {
            scores[pred.userId].giantKiller += 1;
         }
      }
    });

    // B. Calcular la Racha Activa (Cronológica)
    // Ordenamos los partidos terminados del más reciente al más antiguo
    const sortedFinished = [...finishedMatches].sort((a, b) => parseDateForSort(b.date) - parseDateForSort(a.date));

    Object.keys(scores).forEach(uid => {
      let streak = 0;
      for (const match of sortedFinished) {
        const pred = predsByUser[uid]?.[match.id];
        let pts = 0;
        if (pred) {
          pts = calculateMatchPoints(pred.homeScore, pred.awayScore, match.realHomeScore, match.realAwayScore);
        }
        
        if (pts > 0) {
          streak++;
        } else {
          // Apenas encuentra un partido sin acertar, se corta la racha actual
          break; 
        }
      }
      scores[uid].currentStreak = streak;
    });

    // C. Sumar puntos de Candidatos
    if (tournamentResults.realChampion || tournamentResults.realTopScorer || tournamentResults.realBestPlayer) {
      Object.keys(allBonusPreds).forEach(uid => {
        if (!scores[uid]) return;
        const userBonus = allBonusPreds[uid];
        const checkBonus = (userVal, realVal, points) => {
          if (userVal && realVal && userVal.trim().toLowerCase() === realVal.trim().toLowerCase()) {
            scores[uid].points += points;
            scores[uid].bonusPoints += points;
          }
        };
        checkBonus(userBonus.champion, tournamentResults.realChampion, BONUS_POINTS.CHAMPION);
        checkBonus(userBonus.topScorer, tournamentResults.realTopScorer, BONUS_POINTS.SCORER);
        checkBonus(userBonus.bestPlayer, tournamentResults.realBestPlayer, BONUS_POINTS.PLAYER);
      });
    }

    return Object.values(scores).sort((a, b) => b.points !== a.points ? b.points - a.points : b.exact - a.exact);
  }, [matches, allPredictions, usersDb, allBonusPreds, tournamentResults, matchStats]);

  const saveBonusPrediction = async (champion, topScorer, bestPlayer) => {
    if (!user) return;
    try {
      const docRef = doc(getPublicCollection('bonus_predictions'), user.uid);
      await setDoc(docRef, { userId: user.uid, champion, topScorer, bestPlayer, updatedAt: new Date().toISOString() }, { merge: true });
      return true;
    } catch (error) { return false; }
  };

  return { matches, myPredictions, setMyPredictions, ranking, matchStats, loadingDb, myBonusPred, saveBonusPrediction };
}
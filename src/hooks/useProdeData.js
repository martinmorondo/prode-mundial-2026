import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, setDoc, doc } from 'firebase/firestore';
import { db, getPublicCollection } from '../lib/firebase';

// ==========================================
// CONSTANTES Y UTILIDADES PURAS
// ==========================================
const BONUS_POINTS = { CHAMPION: 10, SCORER: 5, PLAYER: 5 };

const calculateMatchPoints = (predHome, predAway, realHome, realAway) => {
  if ([predHome, predAway, realHome, realAway].some(val => val === undefined || val === '')) return 0;

  const ph = parseInt(predHome, 10), pa = parseInt(predAway, 10);
  const rh = parseInt(realHome, 10), ra = parseInt(realAway, 10);
  if (isNaN(ph) || isNaN(pa) || isNaN(rh) || isNaN(ra)) return 0;
  
  if (ph === rh && pa === ra) return 3; 
  
  const predTrend = (ph - pa) > 0 ? 'home' : (ph - pa) < 0 ? 'away' : 'draw';
  const realTrend = (rh - ra) > 0 ? 'home' : (rh - ra) < 0 ? 'away' : 'draw';
  
  if (predTrend === realTrend) return 1; 
  return 0; 
};

const getCommunityTrend = (stats) => {
  if (!stats) return null;
  if (stats.home > stats.away && stats.home > stats.draw) return 'home';
  if (stats.away > stats.home && stats.away > stats.draw) return 'away';
  if (stats.draw > stats.home && stats.draw > stats.away) return 'draw';
  return null;
};

const parseMatchDate = (dStr) => {
  if (!dStr) return null;
  if (typeof dStr === 'string' && dStr.toLowerCase().includes('definir')) return null;
  if (dStr.toDate) return dStr.toDate(); 

  try {
    if (typeof dStr === 'number') {
      return new Date(dStr < 10000000000 ? dStr * 1000 : dStr);
    }
    if (typeof dStr === 'string') {
      let cleanStr = dStr.trim();
      if (/^\d+$/.test(cleanStr)) {
        const num = parseInt(cleanStr, 10);
        return new Date(num < 10000000000 ? num * 1000 : num);
      }
      const isoDate = new Date(cleanStr);
      if (!isNaN(isoDate)) return isoDate;

      // Fallback manual 
      if (cleanStr.includes(' ')) {
        const [datePart, timePart] = cleanStr.split(' ');
        const parts = datePart.split(/[-/]/);
        if (parts.length >= 3) {
          let [y, m, d] = parts[0].length === 4 ? parts : [parts[2], parts[1], parts[0]];
          if (parseInt(m, 10) > 12) [d, m] = [m, d]; // Ajuste defensivo (US format)
          const fallbackDate = new Date(`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}T${timePart}Z`);
          if (!isNaN(fallbackDate)) return fallbackDate;
        }
      }
    }
  } catch (e) {
    console.warn("Error silencioso parseando fecha:", dStr);
  }
  return null;
};

const parseDateForSort = (d) => (d && d instanceof Date && !isNaN(d)) ? d.getTime() : 0;

// ==========================================
// CUSTOM HOOK
// ==========================================
export function useProdeData(user) {
  const [usersDb, setUsersDb] = useState({});
  const [matches, setMatches] = useState([]);
  const [allPredictions, setAllPredictions] = useState([]);
  const [myPredictions, setMyPredictions] = useState({});
  const [allBonusPreds, setAllBonusPreds] = useState({}); 
  const [myBonusPred, setMyBonusPred] = useState({ champion: '', topScorer: '', bestPlayer: '' });
  const [tournamentResults, setTournamentResults] = useState({}); 
  const [loadingDb, setLoadingDb] = useState(true);

  // Suscripciones a Firestore
  useEffect(() => {
    if (!user) return;
    
    const unsubUsers = onSnapshot(getPublicCollection('users'), snap => {
      const uDict = {};
      snap.forEach(d => uDict[d.id] = d.data());
      setUsersDb(uDict);
    });
    
    const unsubMatches = onSnapshot(getPublicCollection('matches'), (snap) => {
      const m = snap.docs.map(d => {
        const data = d.data();
        return { 
          id: d.id, 
          ...data,
          date: parseMatchDate(data.date),
          rawDate: data.date 
        };
      });

      // --- ORDENAMIENTO SEMÁNTICO DE GRUPOS ---
      const orderMap = {
        "GRUPO A": 1, "GRUPO B": 2, "GRUPO C": 3, "GRUPO D": 4,
        "GRUPO E": 5, "GRUPO F": 6, "GRUPO G": 7, "GRUPO H": 8,
        "16AVOS DE FINAL": 9, "OCTAVOS DE FINAL": 10, "CUARTOS DE FINAL": 11,
        "SEMIFINAL": 12, "TERCER PUESTO": 13, "FINAL": 14
      };

      m.sort((a, b) => {
        const orderA = orderMap[a.group] || 99;
        const orderB = orderMap[b.group] || 99;
        
        // Si tienen el mismo grupo, ordenamos por fecha
        if (orderA === orderB) {
          return parseDateForSort(a.date) - parseDateForSort(b.date);
        }
        // Si son grupos distintos, usamos el orden lógico
        return orderA - orderB;
      });

      setMatches(m);
    });

    const unsubPreds = onSnapshot(getPublicCollection('predictions'), snap => {
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
    
    const unsubBonus = onSnapshot(getPublicCollection('bonus_predictions'), snap => {
      const b = {};
      snap.forEach(d => {
        const data = d.data();
        b[d.id] = data; 
        if (d.id === user.uid) setMyBonusPred(data);
      });
      setAllBonusPreds(b);
      setLoadingDb(false);
    });
    
    const unsubResults = onSnapshot(doc(getPublicCollection('settings'), 'bonus_results'), docSnap => {
      if (docSnap.exists()) setTournamentResults(docSnap.data());
    });
    
    return () => { unsubUsers(); unsubMatches(); unsubPreds(); unsubBonus(); unsubResults(); };
  }, [user]);

  // Cálculos memorizados
  const matchStats = useMemo(() => {
    const stats = {};
    allPredictions.forEach(({ matchId, homeScore, awayScore }) => {
      if (!stats[matchId]) stats[matchId] = { home: 0, draw: 0, away: 0, total: 0 };
      
      const home = parseInt(homeScore, 10);
      const away = parseInt(awayScore, 10);
      
      if (!isNaN(home) && !isNaN(away)) {
        const diff = home - away;
        if (diff > 0) stats[matchId].home += 1;
        else if (diff < 0) stats[matchId].away += 1;
        else stats[matchId].draw += 1;
        stats[matchId].total += 1;
      }
    });

    const percentages = {};
    for (const [matchId, s] of Object.entries(stats)) {
      if (s.total > 0) {
        percentages[matchId] = {
          home: Math.round((s.home / s.total) * 100),
          draw: Math.round((s.draw / s.total) * 100),
          away: Math.round((s.away / s.total) * 100),
          total: s.total
        };
      }
    }
    return percentages;
  }, [allPredictions]);

  const ranking = useMemo(() => {
    if (!matches.length || !Object.keys(usersDb).length) return [];
    
    const scores = Object.keys(usersDb).reduce((acc, uid) => {
      acc[uid] = { ...usersDb[uid], points: 0, exact: 0, trends: 0, bonusPoints: 0, currentStreak: 0, giantKiller: 0 };
      return acc;
    }, {});

    const finishedMatches = matches.filter(m => m.status === 'finished');
    const predsByUser = {};
    
    allPredictions.forEach(p => {
      if (!predsByUser[p.userId]) predsByUser[p.userId] = {};
      predsByUser[p.userId][p.matchId] = p;
    });

    allPredictions.forEach(pred => {
      const match = finishedMatches.find(m => m.id === pred.matchId);
      if (!match || !scores[pred.userId]) return;

      const basePts = calculateMatchPoints(pred.homeScore, pred.awayScore, match.realHomeScore, match.realAwayScore);
      const finalPts = pred.isJoker ? basePts * 2 : basePts;

      scores[pred.userId].points += finalPts;
      if (basePts === 3) scores[pred.userId].exact += 1;
      if (basePts === 1) scores[pred.userId].trends += 1;

      // Cálculo de Rompe-Prodes (Giant Killer)
      if (basePts > 0) {
         const communityTrend = getCommunityTrend(matchStats[match.id]);
         const realTrend = (match.realHomeScore - match.realAwayScore) > 0 ? 'home' : (match.realHomeScore - match.realAwayScore) < 0 ? 'away' : 'draw';
         if (communityTrend && communityTrend !== realTrend) scores[pred.userId].giantKiller += 1;
      }
    });

    // Cálculo de Rachas (Streak)
    const sortedFinished = [...finishedMatches].sort((a, b) => parseDateForSort(b.date) - parseDateForSort(a.date));
    Object.keys(scores).forEach(uid => {
      let streak = 0;
      for (const match of sortedFinished) {
        const pred = predsByUser[uid]?.[match.id];
        const pts = pred ? calculateMatchPoints(pred.homeScore, pred.awayScore, match.realHomeScore, match.realAwayScore) : 0;
        if (pts > 0) streak++; else break; 
      }
      scores[uid].currentStreak = streak;
    });

    // Suma de Puntos Bonus
    const { realChampion, realTopScorer, realBestPlayer } = tournamentResults;
    if (realChampion || realTopScorer || realBestPlayer) {
      Object.entries(allBonusPreds).forEach(([uid, userBonus]) => {
        if (!scores[uid]) return;
        
        const checkBonus = (userVal, realVal, points) => {
          if (userVal && realVal && userVal.trim().toLowerCase() === realVal.trim().toLowerCase()) {
            scores[uid].points += points;
            scores[uid].bonusPoints += points;
          }
        };
        
        checkBonus(userBonus.champion, realChampion, BONUS_POINTS.CHAMPION);
        checkBonus(userBonus.topScorer, realTopScorer, BONUS_POINTS.SCORER);
        checkBonus(userBonus.bestPlayer, realBestPlayer, BONUS_POINTS.PLAYER);
      });
    }

    return Object.values(scores).sort((a, b) => b.points !== a.points ? b.points - a.points : b.exact - a.exact);
  }, [matches, allPredictions, usersDb, allBonusPreds, tournamentResults, matchStats]);

  const saveBonusPrediction = async (champion, topScorer, bestPlayer) => {
    if (!user) return false;
    try {
      const docRef = doc(getPublicCollection('bonus_predictions'), user.uid);
      await setDoc(docRef, { userId: user.uid, champion, topScorer, bestPlayer, updatedAt: new Date().toISOString() }, { merge: true });
      return true;
    } catch (error) { 
      console.error("Error guardando bonus", error);
      return false; 
    }
  };

  return { matches, myPredictions, setMyPredictions, ranking, matchStats, loadingDb, myBonusPred, saveBonusPrediction };
}
import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, setDoc, doc, writeBatch } from 'firebase/firestore';
import { db, appId, getPublicCollection } from '../lib/firebase';

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

export function useProdeData(user) {
  const [usersDb, setUsersDb] = useState({});
  const [matches, setMatches] = useState([]);
  const [allPredictions, setAllPredictions] = useState([]);
  const [myPredictions, setMyPredictions] = useState({});
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
      setLoadingDb(false);
    });

    return () => { unsubUsers(); unsubMatches(); unsubPreds(); };
  }, [user]);

  const ranking = useMemo(() => {
    if (!matches.length || !Object.keys(usersDb).length) return [];
    
    const scores = Object.keys(usersDb).reduce((acc, uid) => {
      acc[uid] = { ...usersDb[uid], points: 0, exact: 0, trends: 0 };
      return acc;
    }, {});

    const finishedMatches = matches.filter(m => m.status === 'finished');

    allPredictions.forEach(pred => {
      const match = finishedMatches.find(m => m.id === pred.matchId);
      if (!match || !scores[pred.userId]) return;

      const pts = calculateMatchPoints(pred.homeScore, pred.awayScore, match.realHomeScore, match.realAwayScore);
      scores[pred.userId].points += pts;
      if (pts === 3) scores[pred.userId].exact += 1;
      if (pts === 1) scores[pred.userId].trends += 1;
    });

    return Object.values(scores).sort((a, b) => b.points !== a.points ? b.points - a.points : b.exact - a.exact);
  }, [matches, allPredictions, usersDb]);

  // Calculamos el Termómetro de la Comunidad
  const matchStats = useMemo(() => {
    const stats = {};
    
    // 1. Contamos los votos
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

    // 2. Convertimos a porcentajes
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

  // AQUÍ agregamos matchStats a lo que devuelve el hook
  return { matches, myPredictions, setMyPredictions, ranking, matchStats, loadingDb };

}
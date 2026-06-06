import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5R_wBGBbyaOINHW5VweY4RD8Ff23pk1M",
  authDomain: "prode-la-ronda.firebaseapp.com",
  projectId: "prode-la-ronda",
  storageBucket: "prode-la-ronda.firebasestorage.app",
  messagingSenderId: "347130104784",
  appId: "1:347130104784:web:987856986d55121be447d5",
  measurementId: "G-PF56R8STT1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'prode-la-ronda-01';

export const getPublicCollection = (collectionName) => 
  collection(db, 'artifacts', appId, 'public', 'data', collectionName);

// Agregamos getPublicDoc para que useAuth.js y otros no tiren error
export const getPublicDoc = (collectionName, documentId) => 
  doc(db, 'artifacts', appId, 'public', 'data', collectionName, documentId);
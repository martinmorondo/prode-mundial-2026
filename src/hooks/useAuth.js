import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { getDoc, doc } from "firebase/firestore"; 
import { auth, db, appId } from "../lib/firebase"; 

export function useAuth() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Ahora 'db', 'appId' y 'doc' están definidos gracias a los imports
          const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUser.uid);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            console.warn("El usuario logueado no tiene perfil en Firestore");
          }
        } catch (error) {
          console.error("Error al cargar perfil:", error);
        }
      } else {
        setUserProfile(null);
      }
      setLoadingAuth(false);
    });

    return unsubscribe;
  }, []);

  const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const registerWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  return {
    user,
    userProfile,
    setUserProfile,
    loginWithEmail,
    registerWithEmail,
    logout,
    loadingAuth
  };
}
import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { getDoc } from "firebase/firestore";
import { auth, getPublicDoc } from "../lib/firebase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // Controla la carga inicial

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docSnap = await getDoc(getPublicDoc("users", currentUser.uid));
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          }
        } catch (e) {
          console.error("Error leyendo perfil:", e);
        }
      } else {
        setUserProfile(null);
      }
      setLoadingAuth(false);
    });

    return unsubscribeAuth;
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
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/shared/api';
import { handleRedirectResult } from '@/shared/api';
import { AuthContextType } from '../model/types';

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  isAdmin: false
});

export const useAuth = () => useContext(AuthContext);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Gestione del risultato del redirect (per PWA/Mobile)
    handleRedirectResult().catch(console.error);

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      let adminStatus = false;
      if (currentUser) {
        try {
          const adminDocRef = doc(db, 'admins', currentUser.uid);
          const adminDoc = await getDoc(adminDocRef);
          adminStatus = adminDoc.exists();
        } catch (error) {
          console.error("Errore verifica stato admin:", error);
        }
      }
      setIsAdmin(adminStatus);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};


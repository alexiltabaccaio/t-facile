import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToAuth, checkAdminStatus, handleRedirectResult, User } from '@/shared/api';
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
    // Handle redirect result (for PWA/Mobile)
    handleRedirectResult().catch(console.error);

    const unsubscribeAuth = subscribeToAuth(async (currentUser) => {
      setUser(currentUser);
      
      let adminStatus = false;
      if (currentUser) {
        adminStatus = await checkAdminStatus(currentUser.uid);
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


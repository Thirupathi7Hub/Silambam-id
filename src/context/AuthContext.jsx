// AuthContext — Global auth state + user data management
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { subscribeToAuthChanges } from '@/firebase/auth';
import { getUserById, subscribeToUser } from '@/firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser]   = useState(null);  // Firebase Auth user
  const [userData, setUserData]         = useState(null);  // Firestore user doc
  const [loading, setLoading]           = useState(true);
  const [initialized, setInitialized]   = useState(false);

  useEffect(() => {
    let unsubUser = null;

    const unsubAuth = subscribeToAuthChanges((user) => {
      setCurrentUser(user);

      // Always clean up previous user subscription first
      if (unsubUser) {
        unsubUser();
        unsubUser = null;
      }

      if (user) {
        // Subscribe to real-time member data
        unsubUser = subscribeToUser(user.uid, (data) => {
          setUserData(data);
          setLoading(false);
          setInitialized(true);
        });
      } else {
        // Logged out
        setUserData(null);
        setLoading(false);
        setInitialized(true);
      }
    });

    return () => {
      unsubAuth();
      if (unsubUser) unsubUser();
    };
  }, []);

  // Convenience getters
  const isAdmin = userData?.role === 'admin';
  const isUser  = userData?.role === 'user';
  const isLoggedIn = !!currentUser;

  const value = {
    currentUser,
    userData,
    loading,
    initialized,
    isAdmin,
    isUser,
    isLoggedIn,
    uid: currentUser?.uid,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

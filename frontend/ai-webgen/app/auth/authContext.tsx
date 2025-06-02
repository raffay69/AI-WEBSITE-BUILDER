'use client'
import React, { useContext, useState, useEffect } from "react";
import { GoogleAuthProvider, User, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

interface AuthContextType {
  userLoggedIn: boolean;
  isEmailUser: boolean;
  isGoogleUser: boolean;
  currentUser: User | null;
  loading: boolean;
  getIdToken: () => Promise<string | null>; 
}

const AuthContext = React.createContext<AuthContextType>({
  userLoggedIn: false,
  isEmailUser: false,
  isGoogleUser: false,
  currentUser: null,
  loading: true,
  getIdToken: () => Promise.resolve(null)
});


export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      try {
        if (user && user.emailVerified) {
          setCurrentUser(user);
          setUserLoggedIn(true);
          
          
          // Use proper provider comparison
          const isEmail = user.providerData.some(
            (provider) => provider.providerId === 'password'
          );
          
          const isGoogle = user.providerData.some(
            (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
          );

          setIsEmailUser(isEmail);
          setIsGoogleUser(isGoogle);
          
        } else {
          console.log('No authenticated user');
          setCurrentUser(null);
          setUserLoggedIn(false);
          setIsEmailUser(false);
          setIsGoogleUser(false);
        }
      } catch (error) {
        console.error('Auth state error:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const getIdToken = async (): Promise<string | null> => {
    if (!currentUser) {
      return null;
    }
    try {
      const idToken = await currentUser.getIdToken(true);
      return idToken;
    } catch (error) {
      console.error("Error getting ID token:", error);
      return null;
    }
  };



  const value = {
    userLoggedIn,
    isEmailUser,
    isGoogleUser,
    currentUser,
    loading,
    getIdToken
  };

  return (
    <AuthContext.Provider value={value}>
       {children}
    </AuthContext.Provider>
  );
}
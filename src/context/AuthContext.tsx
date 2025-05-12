
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types/auth';
import { useAuthActions } from '@/hooks/useAuthActions';
import {
  loadUserFromStorage,
  loadDiaryKeyFromSessionStorage,
  clearAuthStorage,
  saveDiaryKeyToSessionStorage,
} from '@/utils/authStorage';
import { useToast } from "@/components/ui/use-toast";

// Create the auth context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [diaryKey, setDiaryKeyState] = useState<string | null>(null);
  const [hasSavedDiaryKey, setHasSavedDiaryKey] = useState(false);
  const { toast } = useToast();
  
  // Get auth actions
  const authActions = useAuthActions();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      const loadedUser = loadUserFromStorage();
      if (loadedUser) {
        setUser(loadedUser);
      }

      // Check if diary key is saved in session
      const savedDiaryKey = loadDiaryKeyFromSessionStorage();
      if (savedDiaryKey) {
        setDiaryKeyState(savedDiaryKey);
        setHasSavedDiaryKey(true);
      }

      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    await authActions.login(email, password);
    // Update local user state after successful login
    const loadedUser = loadUserFromStorage();
    setUser(loadedUser);
  };

  const signup = async (email: string, password: string) => {
    const generatedKey = await authActions.signup(email, password);
    // Update local user state after successful signup
    const loadedUser = loadUserFromStorage();
    setUser(loadedUser);
    return generatedKey;
  };

  const logout = () => {
    setUser(null);
    setDiaryKeyState(null);
    setHasSavedDiaryKey(false);
    clearAuthStorage();
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const setDiaryKey = (key: string) => {
    setDiaryKeyState(key);
  };

  const clearDiaryKey = () => {
    setDiaryKeyState(null);
    setHasSavedDiaryKey(false);
    sessionStorage.removeItem('secretdiary_diary_key');
  };

  const saveDiaryKeyToSession = (key: string) => {
    saveDiaryKeyToSessionStorage(key);
    setDiaryKeyState(key);
    setHasSavedDiaryKey(true);
  };

  const requestPasswordReset = async (email: string) => {
    await authActions.requestPasswordReset(email);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || authActions.isLoading,
    diaryKey,
    login,
    signup,
    logout,
    setDiaryKey,
    clearDiaryKey,
    saveDiaryKeyToSession,
    hasSavedDiaryKey,
    requestPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


import { User } from "@/types/auth";
import { toast } from "@/hooks/use-toast";

// Storage keys
export const LOCAL_STORAGE_KEY = 'secretdiary_auth';
export const SESSION_STORAGE_KEY = 'secretdiary_diary_key';

/**
 * Saves user data to localStorage
 */
export const saveUserToStorage = (user: User): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
};

/**
 * Loads user data from localStorage
 */
export const loadUserFromStorage = (): User | null => {
  const savedUserData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedUserData) {
    try {
      return JSON.parse(savedUserData);
    } catch (e) {
      console.error('Failed to parse user data', e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }
  return null;
};

/**
 * Clears all auth data from storage
 */
export const clearAuthStorage = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
};

/**
 * Saves diary key to session storage
 */
export const saveDiaryKeyToSessionStorage = (key: string): void => {
  sessionStorage.setItem(SESSION_STORAGE_KEY, key);
  toast({
    title: "Diary key saved",
    description: "Your diary key has been saved for this session",
  });
};

/**
 * Loads diary key from session storage
 */
export const loadDiaryKeyFromSessionStorage = (): string | null => {
  return sessionStorage.getItem(SESSION_STORAGE_KEY);
};

/**
 * Generates a random diary key (for demonstration purposes)
 */
export const generateDiaryKey = (): string => {
  return Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 36).toString(36)
  ).join('').toUpperCase();
};

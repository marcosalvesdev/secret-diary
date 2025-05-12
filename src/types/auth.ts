
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  diaryKey: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<string>;
  logout: () => void;
  setDiaryKey: (key: string) => void;
  clearDiaryKey: () => void;
  saveDiaryKeyToSession: (key: string) => void;
  hasSavedDiaryKey: boolean;
  requestPasswordReset: (email: string) => Promise<void>;
}

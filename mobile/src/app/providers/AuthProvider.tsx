import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '@/shared/constants/storage';
import type { User } from '@/shared/types/models';

interface AuthContextValue {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.authToken),
        AsyncStorage.getItem(STORAGE_KEYS.authUser),
      ]);

      if (storedToken) setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser) as User);
      setIsLoading(false);
    };

    void hydrate();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    isLoading,
    isAuthenticated: Boolean(token && user),
    signIn: async (nextToken, nextUser) => {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.authToken, nextToken),
        AsyncStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(nextUser)),
      ]);
      setToken(nextToken);
      setUser(nextUser);
    },
    signOut: async () => {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.authToken),
        AsyncStorage.removeItem(STORAGE_KEYS.authUser),
      ]);
      setToken(null);
      setUser(null);
    },
  }), [isLoading, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}

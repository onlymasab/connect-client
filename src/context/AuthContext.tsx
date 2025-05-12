import {
  createContext,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<any | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session error:', error);
      } else {
        setUser(data.session?.user || null);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [setUser]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Sign-in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error('Sign-up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
    setUser(null);
  };

  const fetchProfile = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Get user error:', error);
      return null;
    }
    return data.user;
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, signIn, signUp, signOut, fetchProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
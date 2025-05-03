import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
  } from 'react';
  import { supabase } from '../lib/supabaseClient';
  
  interface AuthContextType {
    isAuthenticated: boolean | undefined;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    getCurrentUser: () => Promise<any | null>;  // <- added
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
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
  
    useEffect(() => {
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      };
      checkSession();
  
      const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
        setIsAuthenticated(!!session);
      });
  
      return () => {
        listener.subscription.unsubscribe();
      };
    }, []);
  
    const signIn = async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.status === 400 || error.message.includes('Invalid login credentials')) {
          await signUp(email, password);
        } else {
          throw error;
        }
      } else {
        setIsAuthenticated(true);
      }
    };
  
    const signUp = async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setIsAuthenticated(true);
    };
  
    const signOut = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsAuthenticated(false);
    };
  
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }
      return user;
    };
  
    return (
      <AuthContext.Provider value={{ isAuthenticated, signIn, signUp, signOut, getCurrentUser }}>
        {children}
      </AuthContext.Provider>
    );
  };
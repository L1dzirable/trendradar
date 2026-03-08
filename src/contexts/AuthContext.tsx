import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile as UsageProfile, getUserProfile as getUsageProfile, createUserProfile as createUsageProfile } from '../lib/usage';
import { UserProfile as SubscriptionProfile, getUserProfile as getSubscriptionProfile } from '../lib/subscription';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UsageProfile | null;
  subscriptionProfile: SubscriptionProfile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UsageProfile | null>(null);
  const [subscriptionProfile, setSubscriptionProfile] = useState<SubscriptionProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (userId: string) => {
  try {
    const profile = await getUsageProfile(userId);

    if (!profile) {
      await createUsageProfile(userId);
      const newProfile = await getUsageProfile(userId);
      setUserProfile(newProfile);
    } else {
      setUserProfile(profile);
    }

    try {
      const subProfile = await getSubscriptionProfile();
      setSubscriptionProfile(subProfile);
    } catch (e) {
      console.error("Subscription error:", e);
      setSubscriptionProfile(null);
    }

  } catch (e) {
    console.error("User profile error:", e);
    setUserProfile(null);
    setSubscriptionProfile(null);
  }
};

  const refreshProfile = async () => {
    if (user?.id) {
      await loadUserProfile(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
      })();
    });

    // Handle visibility change to refresh profile when user returns
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.id) {
        loadUserProfile(user.id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, userProfile, subscriptionProfile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

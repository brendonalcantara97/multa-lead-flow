import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Get initial session immediately
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        console.log('Initial session:', session ? 'found' : 'not found');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const isTemporaryPassword = session.user.user_metadata?.is_temp_password === true;
          setNeedsPasswordReset(isTemporaryPassword);
        } else {
          setNeedsPasswordReset(false);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Session check error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth event:', event, session ? 'with session' : 'no session');
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const isTemporaryPassword = session.user.user_metadata?.is_temp_password === true;
          setNeedsPasswordReset(isTemporaryPassword);
        } else {
          setNeedsPasswordReset(false);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    getInitialSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    needsPasswordReset,
    loading,
    signOut,
    isAuthenticated: !!session && !!user,
    isAuthorized: !!session && !!user
  };
};
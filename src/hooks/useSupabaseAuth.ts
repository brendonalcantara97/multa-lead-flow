import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Handle auth state changes
  const handleAuthState = (session: Session | null) => {
    console.log('Auth state change:', session ? 'logged in' : 'logged out');
    
    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      // Check if password reset is needed
      const isTemporaryPassword = session.user.user_metadata?.is_temp_password === true;
      setNeedsPasswordReset(isTemporaryPassword);
    } else {
      setNeedsPasswordReset(false);
    }
    
    if (!initialized) {
      setInitialized(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        handleAuthState(session);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      handleAuthState(session);
    });

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
    loading: loading || !initialized,
    signOut,
    isAuthenticated: !!user,
    isAuthorized: !!user
  };
};
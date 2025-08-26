import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthorizedUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
  has_account: boolean;
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authorizedUser, setAuthorizedUser] = useState<AuthorizedUser | null>(null);
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Verificar se usuário está autorizado
  const checkUserAuthorization = async (email: string): Promise<AuthorizedUser | null> => {
    try {
      const { data, error } = await supabase
        .from('authorized_emails')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.log('User not found in authorized_emails:', email);
        return null;
      }

      return data as AuthorizedUser;
    } catch (error) {
      console.error('Error checking user authorization:', error);
      return null;
    }
  };

  // Handle auth state changes
  const handleAuthState = async (session: Session | null) => {
    console.log('Auth state change:', session ? 'logged in' : 'logged out');
    
    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user?.email) {
      try {
        const authorized = await checkUserAuthorization(session.user.email);
        
        if (authorized) {
          setAuthorizedUser(authorized);
          
          // Check if password reset is needed
          const isTemporaryPassword = session.user.user_metadata?.is_temp_password === true;
          setNeedsPasswordReset(isTemporaryPassword);
          
          // Update has_account status if needed
          if (!authorized.has_account) {
            supabase
              .from('authorized_emails')
              .update({ has_account: true })
              .eq('email', session.user.email.toLowerCase())
              .then(() => {
                setAuthorizedUser(prev => prev ? { ...prev, has_account: true } : null);
              });
          }
        } else {
          // Unauthorized user - clear state and sign out
          setAuthorizedUser(null);
          setNeedsPasswordReset(false);
          supabase.auth.signOut();
          console.warn('Usuário não autorizado tentou acessar o sistema');
        }
      } catch (error) {
        console.error('Error in auth state handler:', error);
        setAuthorizedUser(null);
        setNeedsPasswordReset(false);
      }
    } else {
      setAuthorizedUser(null);
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
    setAuthorizedUser(null);
    return { error };
  };

  return {
    user,
    session,
    authorizedUser,
    needsPasswordReset,
    loading: loading || !initialized,
    signOut,
    isAuthenticated: !!user && !!authorizedUser,
    isAuthorized: !!authorizedUser
  };
};
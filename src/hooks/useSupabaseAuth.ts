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

  // Verificar se usuário está autorizado
  const checkUserAuthorization = async (email: string): Promise<AuthorizedUser | null> => {
    try {
      const { data, error } = await supabase
        .from('authorized_emails')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true);

      if (error) {
        console.error('Error checking user authorization:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      return data[0] as AuthorizedUser;
    } catch (error) {
      console.error('Error checking user authorization:', error);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle authorization check asynchronously without blocking the callback
        if (session?.user?.email) {
          setTimeout(async () => {
            if (!isMounted) return;
            
            try {
              const authorized = await checkUserAuthorization(session.user.email);
              
              if (!isMounted) return;
              
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
                      if (isMounted) {
                        setAuthorizedUser(prev => prev ? { ...prev, has_account: true } : null);
                      }
                    });
                }
              } else {
                // Unauthorized user - sign out
                setAuthorizedUser(null);
                setNeedsPasswordReset(false);
                supabase.auth.signOut();
                console.warn('Usuário não autorizado tentou acessar o sistema');
              }
            } catch (error) {
              console.error('Error in auth state change:', error);
              if (isMounted) {
                setAuthorizedUser(null);
                setNeedsPasswordReset(false);
              }
            }
          }, 0);
        } else {
          setAuthorizedUser(null);
          setNeedsPasswordReset(false);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.email) {
        try {
          const authorized = await checkUserAuthorization(session.user.email);
          
          if (!isMounted) return;
          
          if (authorized) {
            setAuthorizedUser(authorized);
            
            // Check if password reset is needed
            const isTemporaryPassword = session.user.user_metadata?.is_temp_password === true;
            setNeedsPasswordReset(isTemporaryPassword);
            
            // Update has_account status if needed
            if (!authorized.has_account) {
              await supabase
                .from('authorized_emails')
                .update({ has_account: true })
                .eq('email', session.user.email.toLowerCase());
              
              if (isMounted) {
                setAuthorizedUser(prev => prev ? { ...prev, has_account: true } : null);
              }
            }
          } else {
            // Unauthorized user - sign out
            setAuthorizedUser(null);
            setNeedsPasswordReset(false);
            await supabase.auth.signOut();
          }
        } catch (error) {
          console.error('Error checking session:', error);
          if (isMounted) {
            setAuthorizedUser(null);
            setNeedsPasswordReset(false);
          }
        }
      }
      
      if (isMounted) {
        setLoading(false);
      }
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
    loading,
    signOut,
    isAuthenticated: !!user && !!authorizedUser,
    isAuthorized: !!authorizedUser
  };
};
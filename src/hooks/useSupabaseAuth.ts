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
  const [loading, setLoading] = useState(true);

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
        return null;
      }

      return data as AuthorizedUser;
    } catch (error) {
      console.error('Error checking user authorization:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.email) {
          // Verificar se usuário está autorizado
          const authorized = await checkUserAuthorization(session.user.email);
          
          if (authorized) {
            setAuthorizedUser(authorized);
            
            // Atualizar status has_account se necessário
            if (!authorized.has_account) {
              await supabase
                .from('authorized_emails')
                .update({ has_account: true })
                .eq('email', session.user.email.toLowerCase());
            }
          } else {
            // Usuário não autorizado - fazer logout
            setAuthorizedUser(null);
            await supabase.auth.signOut();
            console.warn('Usuário não autorizado tentou acessar o sistema');
          }
        } else {
          setAuthorizedUser(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.email) {
        const authorized = await checkUserAuthorization(session.user.email);
        
        if (authorized) {
          setAuthorizedUser(authorized);
          
          // Atualizar status has_account se necessário
          if (!authorized.has_account) {
            await supabase
              .from('authorized_emails')
              .update({ has_account: true })
              .eq('email', session.user.email.toLowerCase());
          }
        } else {
          // Usuário não autorizado - fazer logout
          setAuthorizedUser(null);
          await supabase.auth.signOut();
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
    loading,
    signOut,
    isAuthenticated: !!user && !!authorizedUser,
    isAuthorized: !!authorizedUser
  };
};
import { useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useSessionStore } from '@/src/stores/sessionStore';

export function useAuth() {
  const { session, user, role, setSession, setRole, clear } = useSessionStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clear();
  };

  return { session, user, role, signIn, signUp, signOut, setRole };
}

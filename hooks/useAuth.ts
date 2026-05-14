'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureProfile = async (userId: string, email?: string, username?: string) => {
    if (!supabase) return;
    const fallback = username ?? email?.split('@')[0] ?? 'Player';
    await supabase.from('profiles').upsert(
      { id: userId, username: fallback },
      { onConflict: 'id', ignoreDuplicates: true }
    );
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase не настроен') };
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (!result.error && result.data.user) {
      await ensureProfile(result.data.user.id, email);
    }
    if (result.error) {
      return { error: new Error(translateAuthError(result.error.message)) };
    }
    return result;
  };

  const signUpWithEmail = async (email: string, password: string, username: string) => {
    if (!supabase) return { error: new Error('Supabase не настроен') };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return { error: new Error(translateAuthError(error.message)), data: null };
    }
    if (data.user) {
      await ensureProfile(data.user.id, email, username);
    }
    return { data, error: null };
  };

  const getUsername = async (userId: string): Promise<string> => {
    if (!supabase) return 'Player';
    const { data } = await supabase.from('profiles').select('username').eq('id', userId).single();
    return data?.username ?? 'Player';
  };

  return { user, loading, signOut, signInWithEmail, signUpWithEmail, getUsername };
}

function translateAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('already registered') || m.includes('already exists') || m.includes('user_already_exists'))
    return 'Аккаунт с этой почтой уже существует';
  if (m.includes('invalid login credentials') || m.includes('invalid_credentials'))
    return 'Неверный email или пароль';
  if (m.includes('email not confirmed'))
    return 'Подтвердите почту — мы отправили письмо';
  if (m.includes('password should be') || m.includes('weak_password'))
    return 'Пароль слишком слабый, минимум 8 символов';
  if (m.includes('rate limit'))
    return 'Слишком много попыток, подождите немного';
  if (m.includes('invalid email'))
    return 'Введите корректный email';
  if (m.includes('network') || m.includes('fetch'))
    return 'Нет соединения с сервером';
  return msg;
}

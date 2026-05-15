'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const [ready, setReady]         = useState(false);

  useEffect(() => {
    // Supabase puts the token in the URL hash — it sets the session automatically
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Пароль минимум 8 символов'); return; }
    if (password !== confirm) { setError('Пароли не совпадают'); return; }
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase!.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push('/game'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '32px 28px', width: '100%', maxWidth: 380,
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          fontSize: 28, letterSpacing: 3, color: 'var(--green-hi)', marginBottom: 24,
        }}>
          Новый пароль
        </div>

        {success ? (
          <div style={{ color: 'var(--green-hi)', fontWeight: 700, textAlign: 'center' }}>
            ✓ Пароль изменён! Перенаправляем...
          </div>
        ) : !ready ? (
          <div style={{ color: 'var(--text-2)', fontSize: 14, textAlign: 'center' }}>
            Проверяем ссылку...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="password"
              placeholder="Новый пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                background: 'var(--bg-card-2)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '12px 14px', fontSize: 14,
                color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
              }}
            />
            <input
              type="password"
              placeholder="Повторите пароль"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              style={{
                background: 'var(--bg-card-2)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '12px 14px', fontSize: 14,
                color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
              }}
            />
            {error && (
              <div style={{ color: '#ef4444', fontSize: 13, fontWeight: 600 }}>{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? 'var(--border)' : 'var(--green)',
                border: 'none', borderRadius: 8, padding: '13px',
                fontSize: 15, fontWeight: 900, color: '#0b1a08',
                cursor: loading ? 'wait' : 'pointer',
                fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: 1,
              }}
            >
              {loading ? 'Сохраняем...' : 'Сохранить пароль'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

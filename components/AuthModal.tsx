'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

type AuthModalProps = {
  onClose: () => void;
  onSignIn:  (email: string, password: string) => Promise<{ error: Error | null }>;
  onSignUp:  (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
};

function passwordStrength(p: string): { score: number; label: string; color: string } {
  if (p.length === 0) return { score: 0, label: '', color: '' };
  if (p.length < 6)   return { score: 1, label: 'Слабый',     color: '#e04422' };
  if (p.length < 8)   return { score: 2, label: 'Слабый',     color: '#e04422' };
  let score = 2;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (score >= 5) return { score: 5, label: 'Надёжный',    color: '#5a9028' };
  if (score >= 4) return { score: 4, label: 'Хороший',     color: '#7fc435' };
  return               { score: 3, label: 'Средний',      color: '#d4b040' };
}

type Mode = 'signin' | 'signup' | 'reset';

export function AuthModal({ onClose, onSignIn, onSignUp }: AuthModalProps) {
  const [mode, setMode]          = useState<Mode>('signin');
  const [email, setEmail]        = useState('');
  const [password, setPassword]  = useState('');
  const [username, setUsername]  = useState('');
  const [error, setError]        = useState('');
  const [loading, setLoading]    = useState(false);
  const [success, setSuccess]    = useState('');
  const [cooldown, setCooldown]  = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  const startCooldown = () => {
    setCooldown(30);
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const strength = mode === 'signup' ? passwordStrength(password) : null;

  const switchMode = (m: Mode) => { setMode(m); setError(''); setSuccess(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!username.trim()) { setError('Введите никнейм'); return; }
      if (password.length < 8) { setError('Пароль минимум 8 символов'); return; }
      if (strength && strength.score < 3) { setError('Пароль слишком слабый — добавьте цифры или заглавные буквы'); return; }
    }

    if (mode === 'reset') {
      if (!email) { setError('Введите email'); return; }
      if (!supabase) { setError('Supabase не настроен'); return; }
      setLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: typeof window !== 'undefined'
            ? `${window.location.origin}/auth/reset`
            : 'https://saper.ink/auth/reset',
        });
        if (error) throw error;
        setSuccess('Ссылка отправлена — проверьте почту (и папку Спам)');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Ошибка отправки');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await onSignIn(email, password);
        if (error) throw error;
        onClose();
      } else {
        const { error } = await onSignUp(email, password, username.trim());
        if (error) throw error;
        setSuccess('Проверьте почту — мы отправили ссылку для подтверждения');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Что-то пошло не так';
      setError(msg);
      if (msg.toLowerCase().includes('много попыток') || msg.toLowerCase().includes('rate limit')) {
        startCooldown();
      }
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.07)',
    border: '1px solid var(--border-hi)', borderRadius: 4,
    padding: '10px 14px', fontSize: 15, color: '#fff',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 60, padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border-hi)', borderRadius: 8, padding: '28px 28px 24px', width: '100%', maxWidth: 360 }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 28, letterSpacing: 4, color: 'var(--green-hi)' }}>
            SAPER
          </div>
          <div style={{ color: 'var(--text-2)', fontSize: 12, letterSpacing: 1 }}>
            {mode === 'reset' ? 'ВОССТАНОВЛЕНИЕ ПАРОЛЯ' : 'ВОЙТИ / ЗАРЕГИСТРИРОВАТЬСЯ'}
          </div>
        </div>

        {mode !== 'reset' && (
          <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 4, padding: 3, marginBottom: 18, gap: 3 }}>
            {(['signin', 'signup'] as const).map(t => (
              <button key={t} onClick={() => switchMode(t)}
                style={{ flex: 1, padding: '7px', borderRadius: 3, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800, letterSpacing: 1,
                  background: mode === t ? 'var(--green)' : 'transparent',
                  color: mode === t ? '#fff' : 'var(--text-dim)',
                  transition: 'all 0.15s',
                }}>
                {t === 'signin' ? 'ВОЙТИ' : 'РЕГИСТРАЦИЯ'}
              </button>
            ))}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📧</div>
            <p style={{ color: 'var(--green-hi)', fontSize: 14, fontWeight: 700 }}>{success}</p>
            <button onClick={onClose} style={{ marginTop: 16, background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 24px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              Понятно
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mode === 'signup' && (
              <input type="text" placeholder="Никнейм" value={username} onChange={e => setUsername(e.target.value)} style={inp} autoComplete="username" maxLength={20} />
            )}
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={inp} autoComplete="email" />

            {mode !== 'reset' && (
              <div>
                <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required style={inp} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={mode === 'signup' ? 8 : 1} />
                {mode === 'signup' && strength && strength.label && (
                  <div style={{ marginTop: 5 }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength.score ? strength.color : 'var(--border)' }}/>
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: strength.color }}>{strength.label}</span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(224,68,34,0.15)', border: '1px solid var(--danger)', borderRadius: 4, padding: '8px 12px', fontSize: 13, color: '#ff9977', textAlign: 'center' }}>
                {error}
                {cooldown > 0 && (
                  <div style={{ marginTop: 4, fontWeight: 800, color: '#ffbb88' }}>
                    Повторите через {Math.floor(cooldown / 60)}:{String(cooldown % 60).padStart(2, '0')}
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={loading || cooldown > 0} style={{
              background: loading || cooldown > 0 ? 'var(--border)' : 'var(--green)',
              color: '#fff', border: 'none', borderRadius: 4, padding: '12px',
              fontSize: 15, fontWeight: 800, cursor: loading || cooldown > 0 ? 'not-allowed' : 'pointer',
              letterSpacing: 1, fontFamily: "'Bebas Neue', Impact, sans-serif",
              marginTop: 4, transition: 'opacity 0.15s',
            }}>
              {loading ? 'ЗАГРУЗКА...' : cooldown > 0 ? `ПОДОЖДИТЕ ${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, '0')}` : mode === 'signin' ? 'ВОЙТИ' : mode === 'signup' ? 'СОЗДАТЬ АККАУНТ' : 'ОТПРАВИТЬ ССЫЛКУ'}
            </button>

            {mode === 'signin' && (
              <button type="button" onClick={() => switchMode('reset')} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', textAlign: 'center', marginTop: 2 }}>
                Забыли пароль?
              </button>
            )}
            {mode === 'reset' && (
              <button type="button" onClick={() => switchMode('signin')} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', textAlign: 'center', marginTop: 2 }}>
                ← Назад к входу
              </button>
            )}
          </form>
        )}

        <button onClick={onClose} style={{ display: 'block', width: '100%', background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', marginTop: 14, textAlign: 'center' }}>
          Закрыть
        </button>
      </div>
    </div>
  );
}

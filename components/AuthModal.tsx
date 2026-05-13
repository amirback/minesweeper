'use client';

import React, { useState } from 'react';

type AuthModalProps = {
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  onSignUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
};

export function AuthModal({ onClose, onSignIn, onSignUp }: AuthModalProps) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'signin') {
        const { error } = await onSignIn(email, password);
        if (error) throw error;
        onClose();
      } else {
        if (!username.trim()) {
          throw new Error('Username is required');
        }
        const { error } = await onSignUp(email, password, username.trim());
        if (error) throw error;
        setSuccess('Check your email to confirm your account!');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#0d0f1a',
    border: '1px solid #1e2235',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: 14,
    color: '#e2e8f0',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 60,
        padding: 16,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#151728',
          border: '1px solid #1e2235',
          borderRadius: 16,
          padding: '28px 32px',
          width: '100%',
          maxWidth: 360,
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: '#e2e8f0',
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          💣 MineTrainer
        </h2>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#0d0f1a',
            borderRadius: 8,
            padding: 3,
            marginBottom: 20,
          }}
        >
          {(['signin', 'signup'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                background: tab === t ? '#4f46e5' : 'transparent',
                color: tab === t ? '#fff' : '#64748b',
                transition: 'all 0.15s',
              }}
            >
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📧</div>
            <p style={{ color: '#4ade80', fontSize: 14 }}>{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tab === 'signup' && (
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={inputStyle}
                autoComplete="username"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle}
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
            />

            {error && (
              <p style={{ color: '#f87171', fontSize: 12, textAlign: 'center' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px',
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginTop: 4,
              }}
            >
              {loading ? 'Loading...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        )}

        <button
          onClick={onClose}
          style={{
            display: 'block',
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: '#475569',
            fontSize: 12,
            cursor: 'pointer',
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

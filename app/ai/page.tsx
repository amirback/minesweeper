'use client';

import React, { useState, useRef, useEffect } from 'react';
import { NavWithAuth } from '@/components/NavWithAuth';
import { useAuth } from '@/hooks/useAuth';

const STATS_KEY = 'minetrainer_stats';

type Message = { role: 'user' | 'ai'; text: string };

const QUICK = [
  { label: 'Analyze my games', msg: 'Analyze my game stats and give me personalized tips to improve.' },
  { label: 'Beginner tips', msg: 'What are the most important minesweeper tips for beginners?' },
  { label: 'How to solve 50/50?', msg: 'How do I handle 50/50 situations in minesweeper?' },
  { label: 'How to use numbers?', msg: 'Explain how to read numbers and deduce safe cells.' },
];

function loadLocalStats() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function AIPage() {
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hi! I'm your SAPER assistant. I can analyze your game stats, explain strategies, or help you get unstuck. What do you want to know?" }
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const stats = loadLocalStats();
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, stats }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply ?? data.error ?? 'Something went wrong.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Connection error. Try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavWithAuth user={user} onSignOut={signOut} />

      <main style={{ flex: 1, maxWidth: 720, width: '100%', margin: '0 auto', padding: '24px 16px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            borderRadius: 10, padding: '8px 14px',
            fontFamily: "'Bebas Neue', Impact, sans-serif",
            fontSize: 22, letterSpacing: 2, color: '#fff',
          }}>
            AI ASSISTANT
          </div>
          <span style={{ color: 'var(--text-2)', fontSize: 13 }}>powered by Groq · llama 3.1</span>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {QUICK.map(q => (
            <button key={q.label} onClick={() => send(q.msg)} disabled={loading}
              style={{
                background: 'var(--bg-card-2)', border: '1px solid var(--border)',
                borderRadius: 20, padding: '6px 14px', fontSize: 12,
                color: 'var(--text-2)', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 600,
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseOut={e  => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Chat */}
        <div style={{
          flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
          minHeight: 360,
        }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%',
                background: m.role === 'user'
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : 'var(--bg-card-2)',
                border: m.role === 'ai' ? '1px solid var(--border)' : 'none',
                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '10px 14px',
                fontSize: 14, lineHeight: 1.55,
                color: m.role === 'user' ? '#fff' : 'var(--text)',
                fontWeight: 500,
                whiteSpace: 'pre-wrap',
              }}>
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                background: 'var(--bg-card-2)', border: '1px solid var(--border)',
                borderRadius: '16px 16px 16px 4px', padding: '10px 16px',
                color: 'var(--text-2)', fontSize: 18, letterSpacing: 4,
              }}>
                ···
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={e => { e.preventDefault(); send(input); }}
          style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about minesweeper..."
            disabled={loading}
            style={{
              flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '12px 16px', fontSize: 14,
              color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
              fontWeight: 600,
            }}
            onFocus={e => e.target.style.borderColor = '#ef4444'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
          <button type="submit" disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? 'var(--border)' : '#ef4444',
              border: 'none', borderRadius: 8, padding: '0 20px',
              color: '#fff', fontWeight: 800, fontSize: 14,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              letterSpacing: 1, transition: 'background 0.15s',
            }}>
            SEND
          </button>
        </form>
      </main>
    </div>
  );
}

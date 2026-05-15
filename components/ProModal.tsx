'use client';

import React, { useState } from 'react';

const FEATURES = [
  'Custom board skins (neon, retro, cyberpunk)',
  'Unlimited flags per game',
  'Full game history & replay',
  'Priority AI Coach — no limits',
  'Pro crown on the leaderboard',
];

type Plan = 'monthly' | 'annual';

type Props = { onClose: () => void };

export function ProModal({ onClose }: Props) {
  const [plan, setPlan] = useState<Plan>('annual');

  const price   = plan === 'annual' ? '$2.99' : '$4.99';
  const billing = plan === 'annual' ? 'Billed $35.99/year' : 'Billed every month';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          width: '100%', maxWidth: 400,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          borderBottom: '1px solid var(--border)',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{
            fontFamily: "'Bebas Neue', Impact, sans-serif",
            fontSize: 26, letterSpacing: 2,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            ⚡ SAPER PRO
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-2)', fontSize: 20, lineHeight: 1, padding: 4,
          }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Features list */}
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FEATURES.map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-2)' }}>
                <span style={{ color: '#f59e0b', fontWeight: 900, flexShrink: 0 }}>✓</span>
                {f}
              </li>
            ))}
          </ul>

          {/* Plan toggle */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
          }}>
            {(['monthly', 'annual'] as Plan[]).map(p => (
              <button
                key={p}
                onClick={() => setPlan(p)}
                style={{
                  background: plan === p ? 'rgba(245,158,11,0.12)' : 'var(--bg-card-2)',
                  border: plan === p ? '2px solid #f59e0b' : '2px solid var(--border)',
                  borderRadius: 8, padding: '12px 8px',
                  cursor: 'pointer', textAlign: 'center',
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {p === 'annual' ? 'Annual' : 'Monthly'}
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: plan === p ? '#f59e0b' : 'var(--text)', marginTop: 4 }}>
                  {p === 'annual' ? '$2.99' : '$4.99'}
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)' }}>/mo</span>
                </div>
                {p === 'annual' && (
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#f59e0b', marginTop: 2 }}>SAVE 40%</div>
                )}
              </button>
            ))}
          </div>

          {/* Price summary */}
          <div style={{ fontSize: 12, color: 'var(--text-2)', textAlign: 'center', marginTop: -8 }}>
            {billing}
          </div>

          {/* CTA */}
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: 'none', borderRadius: 8, padding: '13px',
              fontSize: 15, fontWeight: 900, color: '#000',
              cursor: 'pointer', letterSpacing: 0.5,
              fontFamily: "'Bebas Neue', Impact, sans-serif",
            }}
          >
            Get Pro — {price}/mo
          </button>

          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-dim)', marginTop: -8 }}>
            7-day free trial · cancel anytime
          </div>
        </div>
      </div>
    </div>
  );
}

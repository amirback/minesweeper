'use client';

import React from 'react';

const FEATURES = [
  { icon: '🎨', title: 'Custom Skins', desc: 'Exclusive board themes: neon, retro, minimal, cyberpunk' },
  { icon: '🚩', title: 'Unlimited Flags', desc: 'No flag limit — place as many as you need' },
  { icon: '📊', title: 'Advanced Stats', desc: 'Heatmaps, click accuracy, full game replays' },
  { icon: '🤖', title: 'Priority AI Coach', desc: 'Unlimited AI analysis sessions, faster responses' },
  { icon: '👑', title: 'Pro Badge', desc: 'Stand out on the leaderboard with a golden crown' },
  { icon: '⚡', title: 'No Ads (ever)', desc: 'Clean experience, zero distractions' },
];

type Props = { onClose: () => void };

export function ProModal({ onClose }: Props) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid #f59e0b',
          borderRadius: 14,
          width: '100%', maxWidth: 480,
          overflow: 'hidden',
          boxShadow: '0 0 40px rgba(245,158,11,0.2)',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          padding: '24px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: 32, letterSpacing: 3, color: '#000',
            }}>
              ⚡ SAPER PRO
            </div>
            <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)', fontWeight: 600, marginTop: 2 }}>
              Unlock the full experience
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(0,0,0,0.15)', border: 'none', borderRadius: '50%',
            width: 32, height: 32, cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#000',
          }}>✕</button>
        </div>

        {/* Features */}
        <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', letterSpacing: 0.3 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing + CTA */}
        <div style={{ padding: '0 28px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            background: 'var(--bg-card-2)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Monthly</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Billed monthly</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>$4.99<span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>/mo</span></div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(217,119,6,0.1))',
            border: '2px solid #f59e0b',
            borderRadius: 8, padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b' }}>Annual <span style={{ background: '#f59e0b', color: '#000', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 900 }}>SAVE 40%</span></div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Best value · $35.99/year</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#f59e0b' }}>$2.99<span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>/mo</span></div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: 'none', borderRadius: 8, padding: '14px',
              fontSize: 16, fontWeight: 900, color: '#000',
              cursor: 'pointer', letterSpacing: 1, marginTop: 4,
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              transition: 'opacity 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            UPGRADE TO PRO — START FREE TRIAL
          </button>

          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-dim)' }}>
            7-day free trial · Cancel anytime · No credit card required to start
          </div>
        </div>
      </div>
    </div>
  );
}

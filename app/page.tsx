'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function BombSVG() {
  return (
    <svg
      width="160" height="160" viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'bombFloat 3s ease-in-out infinite', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))' }}
    >
      {/* Fuse rope */}
      <path d="M88 48 Q110 30 104 14 Q100 4 112 2"
        stroke="#8B6914" strokeWidth="4" fill="none" strokeLinecap="round"/>

      {/* Flame */}
      <g style={{ animation: 'fuseFlicker 0.3s ease-in-out infinite', transformOrigin: '112px 2px' }}>
        <ellipse cx="112" cy="-2" rx="7" ry="10" fill="#FF6600"/>
        <ellipse cx="112" cy="-5" rx="4" ry="6" fill="#FFD700"/>
        <ellipse cx="112" cy="-7" rx="2" ry="3" fill="#fff"/>
      </g>

      {/* Spikes */}
      {/* top */}
      <line x1="80" y1="28" x2="80" y2="50" stroke="#1e1e1e" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="80" cy="24" r="7" fill="#1e1e1e"/>
      {/* right */}
      <line x1="132" y1="90" x2="110" y2="90" stroke="#1e1e1e" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="136" cy="90" r="7" fill="#1e1e1e"/>
      {/* bottom */}
      <line x1="80" y1="152" x2="80" y2="130" stroke="#1e1e1e" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="80" cy="156" r="7" fill="#1e1e1e"/>
      {/* left */}
      <line x1="28" y1="90" x2="50" y2="90" stroke="#1e1e1e" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="24" cy="90" r="7" fill="#1e1e1e"/>
      {/* diagonals */}
      <line x1="120" y1="50" x2="108" y2="62" stroke="#1e1e1e" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="124" cy="46" r="6" fill="#1e1e1e"/>
      <line x1="40" y1="50" x2="52" y2="62" stroke="#1e1e1e" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="36" cy="46" r="6" fill="#1e1e1e"/>
      <line x1="120" y1="130" x2="108" y2="118" stroke="#1e1e1e" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="124" cy="134" r="6" fill="#1e1e1e"/>
      <line x1="40" y1="130" x2="52" y2="118" stroke="#1e1e1e" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="36" cy="134" r="6" fill="#1e1e1e"/>

      {/* Bomb body */}
      <defs>
        <radialGradient id="b" cx="36%" cy="30%">
          <stop offset="0%" stopColor="#5a5a5a"/>
          <stop offset="60%" stopColor="#2a2a2a"/>
          <stop offset="100%" stopColor="#111"/>
        </radialGradient>
      </defs>
      <circle cx="80" cy="90" r="44" fill="url(#b)"/>

      {/* Shine */}
      <ellipse cx="64" cy="72" rx="12" ry="7"
        fill="rgba(255,255,255,0.12)" transform="rotate(-20,64,72)"/>

      {/* Label */}
      <text x="80" y="94" textAnchor="middle" fill="rgba(255,255,255,0.25)"
        fontSize="12" fontFamily="monospace" letterSpacing="3" fontWeight="700">
        SAPER
      </text>
      <text x="80" y="108" textAnchor="middle" fill="rgba(255,255,255,0.15)"
        fontSize="7" fontFamily="monospace" letterSpacing="2">
        M-1
      </text>
    </svg>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [hover, setHover] = useState(false);
  const [online, setOnline] = useState(0);

  useEffect(() => {
    // Simulate online count until Realtime wires up
    const base = 12 + Math.floor(Math.random() * 24);
    setOnline(base);
    const interval = setInterval(() => {
      setOnline(n => n + (Math.random() > 0.5 ? 1 : -1));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="camo-bg" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', gap: 0, position: 'relative', overflow: 'hidden',
    }}>
      {/* Top-right corner: online badge */}
      <div style={{
        position: 'absolute', top: 20, right: 20,
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(0,0,0,0.45)', border: '1px solid var(--border)',
        borderRadius: 20, padding: '5px 12px', fontSize: 13,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: '#4ca832',
          boxShadow: '0 0 6px #4ca832', display: 'inline-block',
          animation: 'pulse 2s ease-in-out infinite',
        }}/>
        <span style={{ color: 'var(--text-2)', fontWeight: 700 }}>{online} онлайн</span>
      </div>

      {/* Patch border decoration */}
      <div style={{
        border: '3px dashed rgba(107,158,53,0.3)', borderRadius: 20,
        padding: '40px 48px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 24, maxWidth: 500, width: '100%',
        background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
      }}>
        <BombSVG />

        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', Impact, sans-serif",
            fontSize: 'clamp(72px, 20vw, 120px)',
            letterSpacing: 10,
            color: 'var(--text)',
            lineHeight: 1,
            textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 40px rgba(107,158,53,0.3)',
          }}>
            SAPER
          </h1>
          <p style={{
            letterSpacing: 6, fontSize: 14, fontWeight: 600,
            color: 'var(--text-2)', textTransform: 'uppercase', marginTop: 4,
          }}>
            Classic Puzzle
          </p>
        </div>

        <button
          onClick={() => router.push('/game')}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            background: hover ? '#8cc440' : '#6b9e35',
            border: 'none', borderRadius: 4,
            padding: '16px 64px', fontSize: 22, fontWeight: 700,
            fontFamily: "'Bebas Neue', Impact, sans-serif",
            letterSpacing: 6, color: '#0b1a08',
            cursor: 'pointer', transition: 'all 0.15s',
            transform: hover ? 'scale(1.04)' : 'scale(1)',
            boxShadow: hover ? '0 6px 24px rgba(107,158,53,0.5)' : '0 3px 12px rgba(0,0,0,0.4)',
          }}
        >
          ИГРАТЬ
        </button>

        <div style={{
          display: 'flex', gap: 24, fontSize: 12,
          color: 'var(--text-dim)', letterSpacing: 1,
          textTransform: 'uppercase',
        }}>
          <span>AI-подсказки</span>
          <span style={{ color: 'var(--border-hi)' }}>·</span>
          <span>ELO-рейтинг</span>
          <span style={{ color: 'var(--border-hi)' }}>·</span>
          <span>Daily-челлендж</span>
        </div>
      </div>

      {/* Bottom links */}
      <div style={{
        position: 'absolute', bottom: 20,
        display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-dim)',
      }}>
        <a href="/leaderboard" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Таблица лидеров</a>
        <a href="/daily"       style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Daily</a>
        <a href="/stats"       style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Статистика</a>
      </div>
    </div>
  );
}

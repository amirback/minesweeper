'use client';

import React from 'react';

// 8 sapper-themed SVG avatars
const AVATARS: { id: number; name: string; svg: React.ReactNode }[] = [
  {
    id: 0, name: 'Сапёр',
    svg: (
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill="#2d4a1c"/>
        {/* Helmet */}
        <ellipse cx="32" cy="24" rx="14" ry="10" fill="#3a5c28"/>
        <rect x="18" y="28" width="28" height="5" rx="2" fill="#4a7030"/>
        {/* Face */}
        <circle cx="32" cy="40" r="11" fill="#d4a574"/>
        {/* Eyes */}
        <circle cx="27" cy="38" r="2.5" fill="#1a2a10"/>
        <circle cx="37" cy="38" r="2.5" fill="#1a2a10"/>
        <circle cx="28" cy="37" r="0.8" fill="#fff"/>
        <circle cx="38" cy="37" r="0.8" fill="#fff"/>
        {/* Mouth */}
        <path d="M27 44 Q32 47 37 44" stroke="#8a5a3a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 1, name: 'Командир',
    svg: (
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill="#4a1c1c"/>
        {/* Cap */}
        <ellipse cx="32" cy="22" rx="15" ry="6" fill="#6b2828"/>
        <rect x="17" y="22" width="30" height="5" rx="1" fill="#8a3030"/>
        {/* Star */}
        <text x="32" y="22" textAnchor="middle" fontSize="8" fill="#d4b040">★</text>
        {/* Face */}
        <circle cx="32" cy="40" r="11" fill="#c49060"/>
        {/* Eyes */}
        <circle cx="27" cy="38" r="2.5" fill="#1a1010"/>
        <circle cx="37" cy="38" r="2.5" fill="#1a1010"/>
        <circle cx="28" cy="37" r="0.8" fill="#fff"/>
        <circle cx="38" cy="37" r="0.8" fill="#fff"/>
        {/* Stern mouth */}
        <path d="M27 44 Q32 43 37 44" stroke="#7a4a2a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Mustache */}
        <path d="M27 43 Q32 41 37 43" stroke="#3a2010" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 2, name: 'Техник',
    svg: (
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill="#1c2a4a"/>
        {/* Headset */}
        <path d="M18 30 Q18 18 32 18 Q46 18 46 30" stroke="#4a6a9a" strokeWidth="3" fill="none"/>
        <rect x="15" y="28" width="6" height="9" rx="3" fill="#2a4a7a"/>
        <rect x="43" y="28" width="6" height="9" rx="3" fill="#2a4a7a"/>
        {/* Face */}
        <circle cx="32" cy="40" r="11" fill="#c8a080"/>
        {/* Goggles */}
        <rect x="23" y="35" width="8" height="6" rx="3" fill="#2a3a5a" opacity="0.8"/>
        <rect x="33" y="35" width="8" height="6" rx="3" fill="#2a3a5a" opacity="0.8"/>
        <line x1="31" y1="38" x2="33" y2="38" stroke="#4a6a9a" strokeWidth="1"/>
        <circle cx="27" cy="38" r="1.5" fill="#4a9aff" opacity="0.6"/>
        <circle cx="37" cy="38" r="1.5" fill="#4a9aff" opacity="0.6"/>
        <path d="M27 46 Q32 49 37 46" stroke="#8a5a3a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 3, name: 'Разведчик',
    svg: (
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill="#1c3a2a"/>
        {/* Beret */}
        <ellipse cx="32" cy="22" rx="14" ry="8" fill="#2a5a3a"/>
        <ellipse cx="38" cy="20" rx="7" ry="5" fill="#3a7a4a"/>
        {/* Badge */}
        <circle cx="36" cy="20" r="2.5" fill="#d4b040"/>
        <text x="36" y="21.5" textAnchor="middle" fontSize="4" fill="#8a6a00">⚡</text>
        {/* Face */}
        <circle cx="32" cy="40" r="11" fill="#b89060"/>
        {/* Eyes - alert */}
        <circle cx="27" cy="38" r="2.5" fill="#2a1a00"/>
        <circle cx="37" cy="38" r="2.5" fill="#2a1a00"/>
        <circle cx="28" cy="37" r="0.8" fill="#fff"/>
        <circle cx="38" cy="37" r="0.8" fill="#fff"/>
        {/* Smirk */}
        <path d="M28 44 Q33 47 38 44" stroke="#7a4a2a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 4, name: 'Снайпер',
    svg: (
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill="#2a2a1a"/>
        {/* Ghillie hood suggestion */}
        <ellipse cx="32" cy="20" rx="16" ry="10" fill="#3a4a1a"/>
        {/* Leaves hint */}
        <ellipse cx="22" cy="18" rx="5" ry="3" fill="#4a5a20" transform="rotate(-20,22,18)"/>
        <ellipse cx="42" cy="17" rx="5" ry="3" fill="#4a5a20" transform="rotate(15,42,17)"/>
        <ellipse cx="32" cy="14" rx="4" ry="3" fill="#5a6a28"/>
        {/* Face */}
        <circle cx="32" cy="40" r="10" fill="#a07848"/>
        {/* Camo paint */}
        <path d="M22 38 Q27 36 32 38" stroke="#2a3a10" strokeWidth="3" fill="none" opacity="0.5" strokeLinecap="round"/>
        <path d="M32 40 Q37 38 42 40" stroke="#2a3a10" strokeWidth="3" fill="none" opacity="0.5" strokeLinecap="round"/>
        {/* Eyes - focused */}
        <circle cx="27" cy="38" r="2" fill="#1a1a00"/>
        <circle cx="37" cy="38" r="2" fill="#1a1a00"/>
        {/* Mouth */}
        <path d="M27 44 Q32 44 37 44" stroke="#6a3a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 5, name: 'Новичок',
    svg: (
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill="#2a3a4a"/>
        {/* Simple helmet */}
        <ellipse cx="32" cy="24" rx="13" ry="9" fill="#3a4a5a"/>
        <rect x="20" y="28" width="24" height="4" rx="2" fill="#4a5a6a"/>
        {/* Face - nervous */}
        <circle cx="32" cy="40" r="11" fill="#d4b090"/>
        {/* Wide eyes */}
        <circle cx="27" cy="38" r="3" fill="#1a2030"/>
        <circle cx="37" cy="38" r="3" fill="#1a2030"/>
        <circle cx="28" cy="37" r="1.2" fill="#fff"/>
        <circle cx="38" cy="37" r="1.2" fill="#fff"/>
        {/* Sweat */}
        <path d="M41 34 Q42 32 41 31" stroke="#6aadff" strokeWidth="1" fill="none"/>
        {/* Nervous mouth */}
        <path d="M26 45 Q29 43 32 45 Q35 47 38 45" stroke="#8a5a3a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 6, name: 'Офицер',
    svg: (
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill="#3a2a1a"/>
        {/* Officer cap */}
        <ellipse cx="32" cy="20" rx="15" ry="5" fill="#4a3a20"/>
        <rect x="16" y="20" width="32" height="6" rx="1" fill="#5a4a28"/>
        <ellipse cx="32" cy="20" rx="15" ry="3" fill="#6a5a30"/>
        {/* Gold band */}
        <path d="M17 21 Q32 18 47 21" stroke="#d4b040" strokeWidth="1.5" fill="none"/>
        {/* Badge */}
        <circle cx="32" cy="20" r="3" fill="#d4b040"/>
        <text x="32" y="21.5" textAnchor="middle" fontSize="5" fill="#3a2a00">★</text>
        {/* Face */}
        <circle cx="32" cy="40" r="11" fill="#c09060"/>
        {/* Confident eyes */}
        <ellipse cx="27" cy="38" rx="3" ry="2.5" fill="#1a1000"/>
        <ellipse cx="37" cy="38" rx="3" ry="2.5" fill="#1a1000"/>
        <circle cx="28" cy="37" r="0.8" fill="#fff"/>
        <circle cx="38" cy="37" r="0.8" fill="#fff"/>
        {/* Smile */}
        <path d="M26 44 Q32 48 38 44" stroke="#7a4a20" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 7, name: 'Элита',
    svg: (
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill="#1a1a2a"/>
        {/* Black beret */}
        <ellipse cx="32" cy="22" rx="14" ry="7" fill="#1a1a1a"/>
        <ellipse cx="38" cy="20" rx="8" ry="5" fill="#2a2a2a"/>
        {/* Elite badge - skull */}
        <circle cx="36" cy="20" r="3" fill="#c8a040"/>
        <text x="36" y="21.5" textAnchor="middle" fontSize="5" fill="#1a1a00">💀</text>
        {/* Face */}
        <circle cx="32" cy="40" r="11" fill="#a07850"/>
        {/* Scar */}
        <path d="M25 36 L27 42" stroke="#6a3a2a" strokeWidth="1" opacity="0.7"/>
        {/* Eyes - intense */}
        <circle cx="27" cy="38" r="2.5" fill="#0a0a00"/>
        <circle cx="37" cy="38" r="2.5" fill="#0a0a00"/>
        <circle cx="27.5" cy="37.5" r="0.7" fill="#fff"/>
        <circle cx="37.5" cy="37.5" r="0.7" fill="#fff"/>
        {/* Tough expression */}
        <path d="M27 44 Q32 43 37 44" stroke="#5a3a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export { AVATARS };

export function AvatarDisplay({ id, size = 40 }: { id: number; size?: number }) {
  const av = AVATARS.find(a => a.id === id) ?? AVATARS[0];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
      {av.svg}
    </div>
  );
}

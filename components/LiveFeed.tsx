'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getLiveFeed, subscribeToLiveFeed, isSupabaseConfigured, type LiveFeedEntry } from '@/lib/supabase';
import { formatTime } from '@/lib/minesweeper';

const COUNTRY_FLAGS: Record<string, string> = {
  Kazakhstan: '🇰🇿', Russia: '🇷🇺', USA: '🇺🇸', Germany: '🇩🇪',
  UK: '🇬🇧', France: '🇫🇷', Ukraine: '🇺🇦', Turkey: '🇹🇷',
  Japan: '🇯🇵', Korea: '🇰🇷', China: '🇨🇳', India: '🇮🇳',
  Brazil: '🇧🇷', Canada: '🇨🇦', Australia: '🇦🇺', Other: '🌍',
};

function flag(country?: string) {
  if (!country) return '🌍';
  return COUNTRY_FLAGS[country] ?? '🌍';
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function LiveFeed() {
  const [entries, setEntries] = useState<LiveFeedEntry[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured || initialized.current) return;
    initialized.current = true;

    getLiveFeed(12).then(setEntries);

    const unsub = subscribeToLiveFeed(entry => {
      setEntries(prev => [entry, ...prev.slice(0, 11)]);
      const id = entry.created_at;
      setNewIds(prev => new Set([...prev, id]));
      setTimeout(() => setNewIds(prev => { const n = new Set(prev); n.delete(id); return n; }), 2000);
    });

    return unsub;
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>📡</div>
        <p style={{ color: '#475569', fontSize: 12 }}>
          Connect Supabase to see live player activity
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {entries.length === 0 ? (
        <p style={{ color: '#475569', fontSize: 12, textAlign: 'center', padding: 16 }}>
          No recent activity...
        </p>
      ) : (
        entries.map((e, i) => {
          const isNew = newIds.has(e.created_at);
          return (
            <div
              key={`${e.created_at}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 10px',
                background: isNew ? '#1a1d3a' : '#0d0f1a',
                borderRadius: 6,
                border: `1px solid ${isNew ? '#4f46e5' : 'transparent'}`,
                transition: 'all 0.4s ease',
                animation: isNew ? 'slideIn 0.3s ease' : undefined,
              }}
            >
              <span style={{ fontSize: 14 }}>{flag(e.country)}</span>
              <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {e.username}
              </span>
              <span
                style={{
                  fontSize: 10,
                  padding: '1px 5px',
                  borderRadius: 3,
                  fontWeight: 700,
                  background: e.won ? '#052e16' : '#450a0a',
                  color: e.won ? '#4ade80' : '#f87171',
                }}
              >
                {e.difficulty}
              </span>
              {e.won && (
                <span style={{ color: '#60a5fa', fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>
                  {formatTime(e.time_seconds)}
                </span>
              )}
              <span style={{ color: '#334155', fontSize: 10, flexShrink: 0 }}>
                {timeAgo(e.created_at)}
              </span>
            </div>
          );
        })
      )}
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

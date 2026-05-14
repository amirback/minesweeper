'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NavBar } from '@/components/NavBar';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LanguageContext';
import { LANG_LABELS, type Lang } from '@/lib/i18n';
import { AVATARS, AvatarDisplay } from '@/components/Avatars';

const AVATAR_KEY = 'saper_avatar';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { lang, setLang, tr } = useLang();
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = parseInt(localStorage.getItem(AVATAR_KEY) ?? '0', 10);
    setSelectedAvatar(stored);
  }, []);

  const handleSave = () => {
    localStorage.setItem(AVATAR_KEY, String(selectedAvatar));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sectionStyle: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '20px 24px',
  };

  const sectionTitle: React.CSSProperties = {
    color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: 1,
    marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
    textTransform: 'uppercase',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar user={user} onSignOut={signOut} onOpenAuth={() => {}} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px 60px', gap: 20, maxWidth: 560, margin: '0 auto', width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', Impact, sans-serif",
            fontSize: 'clamp(32px, 8vw, 48px)', letterSpacing: 6,
            color: 'var(--green-hi)',
          }}>
            {tr.settingsTitle}
          </h1>
        </div>

        {/* ── Language ── */}
        <div style={{ ...sectionStyle, width: '100%' }}>
          <div style={sectionTitle}>🌐 {tr.languageLabel}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(['en', 'ru', 'kz'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{
                  padding: '10px 20px', borderRadius: 4, fontSize: 14, fontWeight: 800,
                  border: `2px solid ${lang === l ? 'var(--green-hi)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  background: lang === l ? 'rgba(127,196,53,0.15)' : 'var(--bg-card-2)',
                  color: lang === l ? 'var(--green-hi)' : 'var(--text-2)',
                  transition: 'all 0.15s',
                }}>
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 10 }}>
            {lang === 'ru' && 'Язык интерфейса применяется сразу'}
            {lang === 'en' && 'Interface language applied immediately'}
            {lang === 'kz' && 'Интерфейс тілі бірден қолданылады'}
          </p>
        </div>

        {/* ── Avatar ── */}
        <div style={{ ...sectionStyle, width: '100%' }}>
          <div style={sectionTitle}>🪖 {tr.avatarLabel}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {AVATARS.map(av => (
              <button key={av.id}
                onClick={() => setSelectedAvatar(av.id)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
                  border: `3px solid ${selectedAvatar === av.id ? 'var(--green-hi)' : 'var(--border)'}`,
                  boxShadow: selectedAvatar === av.id ? '0 0 12px rgba(127,196,53,0.5)' : 'none',
                  transition: 'all 0.15s',
                  transform: selectedAvatar === av.id ? 'scale(1.08)' : 'scale(1)',
                }}>
                  {av.svg}
                </div>
                <span style={{ color: selectedAvatar === av.id ? 'var(--green-hi)' : 'var(--text-dim)', fontSize: 11, fontWeight: 700 }}>
                  {av.name}
                </span>
              </button>
            ))}
          </div>

          {/* Preview of selected */}
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card-2)', borderRadius: 6, padding: '10px 14px' }}>
            <AvatarDisplay id={selectedAvatar} size={48} />
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{AVATARS[selectedAvatar].name}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>
                {lang === 'ru' ? 'Выбранная аватарка' : lang === 'kz' ? 'Таңдалған аватар' : 'Selected avatar'}
              </div>
            </div>
          </div>
        </div>

        {/* ── Save button ── */}
        <button onClick={handleSave} style={{
          background: saved ? 'var(--green)' : 'var(--green)',
          color: '#0b1a08', border: 'none', borderRadius: 4,
          padding: '14px 48px', fontSize: 18, fontWeight: 800,
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          letterSpacing: 3, cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: saved ? '0 0 20px rgba(127,196,53,0.6)' : 'none',
          width: '100%', maxWidth: 340,
        }}>
          {saved
            ? (lang === 'ru' ? '✓ СОХРАНЕНО' : lang === 'kz' ? '✓ САҚТАЛДЫ' : '✓ SAVED')
            : tr.saveBtn.toUpperCase()}
        </button>

        {/* ── Support ── */}
        <div style={{ ...sectionStyle, width: '100%' }}>
          <div style={sectionTitle}>📬 {tr.supportTitle}</div>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 14, lineHeight: 1.6 }}>
            {tr.supportText}
          </p>
          <a href="mailto:saperminesweeper@gmail.com"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'var(--bg-card-2)', border: '1px solid var(--border-hi)',
              borderRadius: 6, padding: '12px 18px',
              color: 'var(--green-hi)', textDecoration: 'none',
              fontSize: 15, fontWeight: 800, letterSpacing: 0.5,
              transition: 'all 0.15s',
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(127,196,53,0.1)')}
            onMouseOut={e => (e.currentTarget.style.background = 'var(--bg-card-2)')}>
            ✉️ saperminesweeper@gmail.com
          </a>
          <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 10 }}>
            {lang === 'ru' && 'Обычно отвечаем в течение 24 часов'}
            {lang === 'en' && 'Usually reply within 24 hours'}
            {lang === 'kz' && 'Әдетте 24 сағат ішінде жауап береміз'}
          </p>
        </div>

        <Link href="/game" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: 13 }}>
          ← {lang === 'ru' ? 'Назад к игре' : lang === 'kz' ? 'Ойынға оралу' : 'Back to game'}
        </Link>
      </main>
    </div>
  );
}

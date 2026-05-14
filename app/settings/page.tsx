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
  const { user, signOut, changeUsername, getUsername } = useAuth();
  const { lang, setLang, tr } = useLang();
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [saved, setSaved] = useState(false);
  const [nickname, setNickname] = useState('');
  const [nickSaving, setNickSaving] = useState(false);
  const [nickMsg, setNickMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    const stored = parseInt(localStorage.getItem(AVATAR_KEY) ?? '0', 10);
    setSelectedAvatar(stored);
  }, []);

  // Load current username when user is logged in
  useEffect(() => {
    if (user) {
      getUsername(user.id).then(name => setNickname(name === 'Player' ? '' : name));
    }
  }, [user]);

  const handleSave = () => {
    localStorage.setItem(AVATAR_KEY, String(selectedAvatar));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleNicknameSave = async () => {
    if (!nickname.trim()) return;
    setNickSaving(true);
    setNickMsg(null);
    const { error } = await changeUsername(nickname.trim());
    if (error) {
      setNickMsg({ text: typeof error === 'string' ? error : 'Ошибка сохранения', ok: false });
    } else {
      setNickMsg({ text: lang === 'ru' ? 'Никнейм сохранён!' : lang === 'kz' ? 'Лақап аты сақталды!' : 'Nickname saved!', ok: true });
    }
    setNickSaving(false);
    setTimeout(() => setNickMsg(null), 3000);
  };

  const section: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '20px 24px', width: '100%',
  };

  const sTitle: React.CSSProperties = {
    color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: 1,
    marginBottom: 16, textTransform: 'uppercase',
    display: 'flex', alignItems: 'center', gap: 8,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar user={user} onSignOut={signOut} onOpenAuth={() => {}} />

      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '24px 16px 60px', gap: 20, maxWidth: 560, margin: '0 auto', width: '100%',
      }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          fontSize: 'clamp(32px,8vw,48px)', letterSpacing: 6, color: 'var(--green-hi)',
        }}>
          {tr.settingsTitle}
        </h1>

        {/* ── Language ── */}
        <div style={section}>
          <div style={sTitle}>🌐 {tr.languageLabel}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(['en', 'ru', 'kz'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: '10px 20px', borderRadius: 4, fontSize: 14, fontWeight: 800,
                border: `2px solid ${lang === l ? 'var(--green-hi)' : 'var(--border)'}`,
                cursor: 'pointer',
                background: lang === l ? 'rgba(127,196,53,0.18)' : 'transparent',
                color: lang === l ? 'var(--green-hi)' : 'var(--text-2)',
                transition: 'all 0.15s',
              }}>
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
        </div>

        {/* ── Nickname ── */}
        <div style={section}>
          <div style={sTitle}>
            ✏️ {lang === 'ru' ? 'Никнейм' : lang === 'kz' ? 'Лақап аты' : 'Nickname'}
          </div>

          {!user ? (
            <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
              {lang === 'ru' ? 'Войдите в аккаунт чтобы изменить никнейм' : lang === 'kz' ? 'Лақап атын өзгерту үшін кіріңіз' : 'Sign in to change your nickname'}
            </p>
          ) : (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                maxLength={24}
                placeholder={lang === 'ru' ? 'Новый никнейм' : lang === 'kz' ? 'Жаңа лақап аты' : 'New nickname'}
                style={{
                  flex: 1, minWidth: 160,
                  background: 'rgba(255,255,255,0.07)', border: '1px solid var(--border)',
                  borderRadius: 4, padding: '10px 14px', fontSize: 15, color: '#fff',
                  outline: 'none', fontFamily: 'inherit',
                }}
                onKeyDown={e => e.key === 'Enter' && handleNicknameSave()}
              />
              <button onClick={handleNicknameSave} disabled={nickSaving || !nickname.trim()} style={{
                background: 'var(--green)', color: '#0b1a08', border: 'none', borderRadius: 4,
                padding: '10px 20px', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                opacity: nickSaving || !nickname.trim() ? 0.5 : 1,
              }}>
                {nickSaving ? '...' : (lang === 'ru' ? 'Сохранить' : lang === 'kz' ? 'Сақтау' : 'Save')}
              </button>
            </div>
          )}

          {nickMsg && (
            <div style={{
              marginTop: 10, padding: '8px 12px', borderRadius: 4, fontSize: 13,
              background: nickMsg.ok ? 'rgba(127,196,53,0.15)' : 'rgba(224,68,34,0.15)',
              border: `1px solid ${nickMsg.ok ? 'var(--green)' : 'var(--danger)'}`,
              color: nickMsg.ok ? 'var(--green-hi)' : '#ff9977',
            }}>
              {nickMsg.text}
            </div>
          )}

          <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 10 }}>
            {lang === 'ru' && 'Этот ник будет виден в лидерборде и активности'}
            {lang === 'en' && 'This nickname appears in leaderboard and activity feed'}
            {lang === 'kz' && 'Бұл лақап аты рейтинг пен белсенділікте көрінеді'}
          </p>
        </div>

        {/* ── Avatar ── */}
        <div style={section}>
          <div style={sTitle}>🪖 {tr.avatarLabel}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {AVATARS.map(av => (
              <button key={av.id} onClick={() => setSelectedAvatar(av.id)} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
                  border: `3px solid ${selectedAvatar === av.id ? 'var(--green-hi)' : 'var(--border)'}`,
                  boxShadow: selectedAvatar === av.id ? '0 0 14px rgba(127,196,53,0.5)' : 'none',
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

          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '10px 14px', border: '1px solid var(--border)' }}>
            <AvatarDisplay id={selectedAvatar} size={48} />
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{AVATARS[selectedAvatar].name}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>
                {lang === 'ru' ? 'Выбранная аватарка' : lang === 'kz' ? 'Таңдалған аватар' : 'Selected avatar'}
              </div>
            </div>
          </div>
        </div>

        {/* Save avatar */}
        <button onClick={handleSave} style={{
          background: 'var(--green)', color: '#0b1a08', border: 'none', borderRadius: 4,
          padding: '14px 48px', fontSize: 18, fontWeight: 800,
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          letterSpacing: 3, cursor: 'pointer', width: '100%', maxWidth: 340,
          boxShadow: saved ? '0 0 20px rgba(127,196,53,0.5)' : 'none',
          transition: 'all 0.2s',
        }}>
          {saved
            ? (lang === 'ru' ? '✓ СОХРАНЕНО' : lang === 'kz' ? '✓ САҚТАЛДЫ' : '✓ SAVED')
            : tr.saveBtn?.toUpperCase() ?? 'SAVE'}
        </button>

        {/* ── Support ── */}
        <div style={section}>
          <div style={sTitle}>📬 {tr.supportTitle}</div>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 14, lineHeight: 1.6 }}>
            {tr.supportText}
          </p>
          <a
            href="mailto:saperminesweeper@gmail.com"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-hi)',
              borderRadius: 6, padding: '12px 18px',
              color: 'var(--green-hi)', textDecoration: 'none',
              fontSize: 15, fontWeight: 800, transition: 'all 0.15s',
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(127,196,53,0.1)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
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

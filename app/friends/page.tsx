'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { NavWithAuth } from '@/components/NavWithAuth';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LanguageContext';
import {
  findPlayerByShortId, sendFriendRequest, respondToFriendRequest,
  getFriendships, getMessages, sendMessage, subscribeToMessages,
  type FriendEntry, type ChatMessage,
} from '@/lib/supabase';

export default function FriendsPage() {
  const { user, signOut } = useAuth();
  const { lang } = useLang();

  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [addId, setAddId] = useState('');
  const [addMsg, setAddMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeFriend, setActiveFriend] = useState<FriendEntry | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const t = {
    title:     lang === 'ru' ? 'Друзья' : lang === 'kz' ? 'Достар' : 'Friends',
    addFriend: lang === 'ru' ? 'Добавить друга' : lang === 'kz' ? 'Дос қосу' : 'Add Friend',
    addPlaceholder: lang === 'ru' ? 'ID игрока (12 символов)' : lang === 'kz' ? 'Ойыншы ID' : 'Player ID (12 chars)',
    send:      lang === 'ru' ? 'Отправить запрос' : lang === 'kz' ? 'Сұраныс жіберу' : 'Send Request',
    accepted:  lang === 'ru' ? 'Принятые' : lang === 'kz' ? 'Қабылданған' : 'Friends',
    pending:   lang === 'ru' ? 'Ожидают ответа' : lang === 'kz' ? 'Жауап күтеді' : 'Pending',
    accept:    lang === 'ru' ? 'Принять' : lang === 'kz' ? 'Қабылдау' : 'Accept',
    decline:   lang === 'ru' ? 'Отклонить' : lang === 'kz' ? 'Бас тарту' : 'Decline',
    chat:      lang === 'ru' ? 'Чат' : lang === 'kz' ? 'Чат' : 'Chat',
    msgPlaceholder: lang === 'ru' ? 'Напишите сообщение...' : lang === 'kz' ? 'Хабарлама жазыңыз...' : 'Type a message...',
    noFriends: lang === 'ru' ? 'Пока нет друзей — добавьте по ID' : lang === 'kz' ? 'Достар жоқ — ID бойынша қосыңыз' : 'No friends yet — add by ID',
    notLoggedIn: lang === 'ru' ? 'Войдите чтобы добавлять друзей' : lang === 'kz' ? 'Достарды қосу үшін кіріңіз' : 'Sign in to add friends',
    outgoing:  lang === 'ru' ? 'Исходящие' : lang === 'kz' ? 'Шығыс' : 'Sent',
    incoming:  lang === 'ru' ? 'Входящие' : lang === 'kz' ? 'Кіріс' : 'Incoming',
  };

  const reload = async () => {
    if (!user) return;
    setFriends(await getFriendships(user.id));
  };

  useEffect(() => { reload(); }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToMessages(user.id, (msg) => {
      setMessages(prev => [...prev, msg]);
      if (activeFriend && (msg.from_id === activeFriend.requester_id || msg.from_id === activeFriend.addressee_id)) {
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    });
    return unsub;
  }, [user, activeFriend]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAddFriend = async () => {
    if (!user || !addId.trim()) return;
    setLoading(true);
    setAddMsg(null);
    const clean = addId.trim().toUpperCase().replace(/[^A-F0-9]/g, '');
    const myShort = user.id.replace(/-/g, '').slice(0, 12).toUpperCase();
    if (clean === myShort) {
      setAddMsg({ text: lang === 'ru' ? 'Нельзя добавить себя' : 'Cannot add yourself', ok: false });
      setLoading(false);
      return;
    }
    const target = await findPlayerByShortId(clean);
    if (!target) {
      setAddMsg({ text: lang === 'ru' ? 'Игрок не найден' : 'Player not found', ok: false });
      setLoading(false);
      return;
    }
    const { error } = await sendFriendRequest(user.id, target.id);
    if (error) {
      setAddMsg({ text: lang === 'ru' ? 'Уже отправлено или уже друзья' : 'Already sent or already friends', ok: false });
    } else {
      setAddMsg({ text: `${lang === 'ru' ? 'Запрос отправлен' : 'Request sent'} → ${target.username}`, ok: true });
      setAddId('');
      reload();
    }
    setLoading(false);
    setTimeout(() => setAddMsg(null), 4000);
  };

  const handleRespond = async (id: string, accept: boolean) => {
    await respondToFriendRequest(id, accept);
    reload();
  };

  const openChat = async (friend: FriendEntry) => {
    if (!user) return;
    setActiveFriend(friend);
    const friendId = friend.requester_id === user.id ? friend.addressee_id : friend.requester_id;
    const msgs = await getMessages(user.id, friendId);
    setMessages(msgs);
  };

  const handleSend = async () => {
    if (!user || !activeFriend || !chatInput.trim()) return;
    const friendId = activeFriend.requester_id === user.id ? activeFriend.addressee_id : activeFriend.requester_id;
    setSending(true);
    const myMsg: ChatMessage = {
      id: Date.now().toString(), from_id: user.id, to_id: friendId,
      content: chatInput.trim(), created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, myMsg]);
    setChatInput('');
    await sendMessage(user.id, friendId, myMsg.content);
    setSending(false);
  };

  const card: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '18px 20px', width: '100%',
  };
  const cardTitle: React.CSSProperties = {
    color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: 1,
    marginBottom: 14, textTransform: 'uppercase',
    display: 'flex', alignItems: 'center', gap: 8,
  };

  const accepted = friends.filter(f => f.status === 'accepted');
  const incomingPending = friends.filter(f => f.status === 'pending' && f.addressee_id === user?.id);
  const outgoingPending = friends.filter(f => f.status === 'pending' && f.requester_id === user?.id);

  const getFriendName = (f: FriendEntry) =>
    f.requester_id === user?.id ? f.addressee_name : f.requester_name;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavWithAuth user={user} onSignOut={signOut} />

      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '24px 16px 60px', gap: 20, maxWidth: 600, margin: '0 auto', width: '100%',
      }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          fontSize: 'clamp(32px,8vw,48px)', letterSpacing: 6, color: 'var(--green-hi)',
        }}>
          {t.title}
        </h1>

        {!user ? (
          <div style={{ ...card, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{t.notLoggedIn}</p>
          </div>
        ) : (
          <>
            {/* Add Friend */}
            <div style={card}>
              <div style={cardTitle}>{t.addFriend}</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={addId}
                  onChange={e => setAddId(e.target.value.toUpperCase().replace(/[^A-F0-9]/g,'').slice(0,12))}
                  placeholder={t.addPlaceholder}
                  maxLength={12}
                  onKeyDown={e => e.key === 'Enter' && handleAddFriend()}
                  style={{
                    flex: 1, minWidth: 200, background: 'rgba(255,255,255,0.07)',
                    border: '1px solid var(--border)', borderRadius: 4,
                    padding: '10px 14px', fontSize: 15, color: '#fff',
                    outline: 'none', fontFamily: 'monospace', letterSpacing: 2,
                  }}
                />
                <button
                  onClick={handleAddFriend}
                  disabled={loading || addId.length < 8}
                  style={{
                    background: 'var(--green)', color: '#0b1a08', border: 'none',
                    borderRadius: 4, padding: '10px 18px', fontSize: 14,
                    fontWeight: 800, cursor: 'pointer',
                    opacity: loading || addId.length < 8 ? 0.5 : 1,
                  }}>
                  {loading ? '...' : t.send}
                </button>
              </div>
              {addMsg && (
                <div style={{
                  marginTop: 10, padding: '8px 12px', borderRadius: 4, fontSize: 13,
                  background: addMsg.ok ? 'rgba(127,196,53,0.15)' : 'rgba(224,68,34,0.15)',
                  border: `1px solid ${addMsg.ok ? 'var(--green)' : 'var(--danger)'}`,
                  color: addMsg.ok ? 'var(--green-hi)' : '#ff9977',
                }}>{addMsg.text}</div>
              )}
              <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 10 }}>
                {lang === 'ru' && 'Найдите ID друга в его Настройках → Ваш ID игрока'}
                {lang === 'en' && "Find friend's ID in their Settings → Your Player ID"}
                {lang === 'kz' && "Досыңыздың ID-ін Баптаулардан табыңыз → Ойыншы ID"}
              </p>
            </div>

            {/* Incoming requests */}
            {incomingPending.length > 0 && (
              <div style={card}>
                <div style={cardTitle}>{t.incoming} ({incomingPending.length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {incomingPending.map(f => (
                    <div key={f.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '10px 14px',
                      flexWrap: 'wrap', gap: 8,
                    }}>
                      <span style={{ color: '#fff', fontWeight: 700 }}>{f.requester_name}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleRespond(f.id, true)} style={{
                          background: 'var(--green)', color: '#0b1a08', border: 'none',
                          borderRadius: 4, padding: '6px 14px', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                        }}>{t.accept}</button>
                        <button onClick={() => handleRespond(f.id, false)} style={{
                          background: 'transparent', color: 'var(--text-dim)',
                          border: '1px solid var(--border)', borderRadius: 4,
                          padding: '6px 14px', fontSize: 13, cursor: 'pointer',
                        }}>{t.decline}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends list */}
            <div style={card}>
              <div style={cardTitle}>{t.accepted}</div>
              {accepted.length === 0 ? (
                <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>{t.noFriends}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {accepted.map(f => {
                    const name = getFriendName(f);
                    const isActive = activeFriend?.id === f.id;
                    return (
                      <div key={f.id}>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: isActive ? 'rgba(127,196,53,0.12)' : 'rgba(255,255,255,0.04)',
                          borderRadius: 6, padding: '10px 14px', flexWrap: 'wrap', gap: 8,
                          border: isActive ? '1px solid var(--border-hi)' : '1px solid transparent',
                        }}>
                          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{name}</span>
                          <button
                            onClick={() => isActive ? setActiveFriend(null) : openChat(f)}
                            style={{
                              background: isActive ? 'transparent' : 'var(--green)',
                              color: isActive ? 'var(--text-2)' : '#0b1a08',
                              border: isActive ? '1px solid var(--border)' : 'none',
                              borderRadius: 4, padding: '6px 14px', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                            }}>
                            {isActive ? '✕' : t.chat}
                          </button>
                        </div>

                        {/* Chat window */}
                        {isActive && (
                          <div style={{
                            border: '1px solid var(--border-hi)', borderTop: 'none',
                            borderRadius: '0 0 6px 6px',
                            background: 'rgba(8,18,4,0.98)',
                          }}>
                            <div style={{
                              height: 280, overflowY: 'auto', padding: '12px 14px',
                              display: 'flex', flexDirection: 'column', gap: 8,
                            }}>
                              {messages.length === 0 && (
                                <p style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', marginTop: 'auto' }}>
                                  {lang === 'ru' ? 'Начните переписку!' : 'Start the conversation!'}
                                </p>
                              )}
                              {messages.map(msg => {
                                const isMine = msg.from_id === user.id;
                                return (
                                  <div key={msg.id} style={{
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: isMine ? 'flex-end' : 'flex-start',
                                  }}>
                                    <div style={{
                                      maxWidth: '75%', padding: '8px 12px', borderRadius: isMine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                      background: isMine ? 'var(--green)' : 'rgba(255,255,255,0.10)',
                                      color: isMine ? '#0b1a08' : '#fff',
                                      fontSize: 14, fontWeight: isMine ? 700 : 400,
                                      wordBreak: 'break-word',
                                    }}>
                                      {msg.content}
                                    </div>
                                    <span style={{ color: 'var(--text-dim)', fontSize: 10, marginTop: 2 }}>
                                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                );
                              })}
                              <div ref={chatEndRef} />
                            </div>
                            <div style={{ borderTop: '1px solid var(--border)', padding: '10px 14px', display: 'flex', gap: 8 }}>
                              <input
                                type="text"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                placeholder={t.msgPlaceholder}
                                maxLength={500}
                                style={{
                                  flex: 1, background: 'rgba(255,255,255,0.07)',
                                  border: '1px solid var(--border)', borderRadius: 4,
                                  padding: '8px 12px', fontSize: 14, color: '#fff',
                                  outline: 'none', fontFamily: 'inherit',
                                }}
                              />
                              <button
                                onClick={handleSend}
                                disabled={sending || !chatInput.trim()}
                                style={{
                                  background: 'var(--green)', color: '#0b1a08', border: 'none',
                                  borderRadius: 4, padding: '8px 16px', fontSize: 18,
                                  cursor: 'pointer', opacity: sending || !chatInput.trim() ? 0.5 : 1,
                                }}>
                                ➤
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Outgoing pending */}
            {outgoingPending.length > 0 && (
              <div style={card}>
                <div style={cardTitle}>{t.outgoing}</div>
                {outgoingPending.map(f => (
                  <div key={f.id} style={{
                    color: 'var(--text-2)', fontSize: 14, padding: '6px 0',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    {f.addressee_name}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <Link href="/game" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: 13 }}>
          ← {lang === 'ru' ? 'Назад к игре' : lang === 'kz' ? 'Ойынға оралу' : 'Back to game'}
        </Link>
      </main>
    </div>
  );
}

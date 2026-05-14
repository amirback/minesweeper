'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { t, type Lang, type Translations } from '@/lib/i18n';

type LangCtx = { lang: Lang; setLang: (l: Lang) => void; tr: Translations };

const LanguageContext = createContext<LangCtx>({ lang: 'ru', setLang: () => {}, tr: t.ru });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ru');

  useEffect(() => {
    const stored = (typeof window !== 'undefined' ? localStorage.getItem('saper_lang') : null) as Lang | null;
    if (stored && ['en', 'ru', 'kz'].includes(stored)) setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== 'undefined') localStorage.setItem('saper_lang', l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, tr: t[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function TwemojiLoader() {
  const pathname = usePathname();

  useEffect(() => {
    const parse = () => {
      const tw = (window as any).twemoji;
      if (tw) tw.parse(document.body, { folder: 'svg', ext: '.svg' });
    };

    if (document.getElementById('twemoji-script')) {
      setTimeout(parse, 60);
      return;
    }

    const s = document.createElement('script');
    s.id = 'twemoji-script';
    s.src = 'https://cdn.jsdelivr.net/npm/@twemoji/api@latest/dist/twemoji.min.js';
    s.crossOrigin = 'anonymous';
    s.onload = () => setTimeout(parse, 60);
    document.head.appendChild(s);
  }, [pathname]);

  return null;
}

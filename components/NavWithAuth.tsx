'use client';

import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { NavBar } from './NavBar';
import { AuthModal } from './AuthModal';
import { useAuth } from '@/hooks/useAuth';

type Props = {
  user: User | null;
  onSignOut: () => void;
  cloudElo?: number;
};

export function NavWithAuth({ user, onSignOut, cloudElo }: Props) {
  const [authOpen, setAuthOpen] = useState(false);
  const { signInWithEmail, signUpWithEmail } = useAuth();

  return (
    <>
      <NavBar
        user={user}
        onSignOut={onSignOut}
        onOpenAuth={() => setAuthOpen(true)}
        cloudElo={cloudElo}
      />
      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onSignIn={signInWithEmail}
          onSignUp={signUpWithEmail}
        />
      )}
    </>
  );
}

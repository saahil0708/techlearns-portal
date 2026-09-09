import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthPageClient from '@/components/auth/AuthPageClient';

export const metadata: Metadata = {
  title: 'Sign In | CodePlatform',
  description: 'Sign in to CodePlatform competitive coding and algorithmic workspace.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageClient />
    </Suspense>
  );
}

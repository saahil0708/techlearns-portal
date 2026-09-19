import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthPageClient from '@/components/auth/AuthPageClient';

export const metadata: Metadata = {
  title: 'Sign In / Register | CodePlatform',
  description:
    'Sign in or register for CodePlatform competitive programming, collegiate tournaments, and multi-tenant STEM coding labs.',
};

/**
 * Authentication Page (SSR boundary)
 */
export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageClient />
    </Suspense>
  );
}

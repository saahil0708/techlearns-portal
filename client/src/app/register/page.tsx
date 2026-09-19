import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthPageClient from '@/components/auth/AuthPageClient';

export const metadata: Metadata = {
  title: 'Create Account | CodePlatform',
  description: 'Create an account on CodePlatform for competitive coding and course curriculum.',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageClient />
    </Suspense>
  );
}

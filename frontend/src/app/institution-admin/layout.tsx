import React from 'react';
import type { Metadata } from 'next';
import InstitutionAdminAuthGuard from '@/components/auth/InstitutionAdminAuthGuard';

export const metadata: Metadata = {
  title: 'Institution Admin Portal | CodePlatform',
  description: 'Manage institutional faculty mentors, class cohorts, student rosters, and college performance analytics.',
};

export default function InstitutionAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InstitutionAdminAuthGuard>{children}</InstitutionAdminAuthGuard>;
}

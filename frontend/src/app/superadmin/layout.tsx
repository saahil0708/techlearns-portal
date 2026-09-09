import React from 'react';
import SuperAdminAuthGuard from '@/components/auth/SuperAdminAuthGuard';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperAdminAuthGuard>{children}</SuperAdminAuthGuard>;
}

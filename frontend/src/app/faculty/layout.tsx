import React from 'react';
import FacultyAuthGuard from '@/components/auth/FacultyAuthGuard';

export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FacultyAuthGuard>{children}</FacultyAuthGuard>;
}

import React from 'react';
import type { Metadata } from 'next';
import InstitutionStudentsClient from '@/components/institution-admin/students/InstitutionStudentsClient';

export const metadata: Metadata = {
  title: 'Student Directory | CodePlatform Institution Admin',
  description: 'Master student roster and performance analytics across institutional cohorts.',
};

export const dynamic = 'force-dynamic';

export default function InstitutionStudentsPage() {
  return <InstitutionStudentsClient />;
}

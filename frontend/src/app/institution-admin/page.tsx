import React from 'react';
import type { Metadata } from 'next';
import InstitutionAdminDashboardClient from '@/components/institution-admin/dashboard/InstitutionAdminDashboardClient';

export const metadata: Metadata = {
  title: 'Campus Overview | CodePlatform Institution Admin',
  description: 'Manage departmental faculty, student cohorts, lab challenges, and campus coding performance.',
};

export const dynamic = 'force-dynamic';

export default function InstitutionAdminDashboardPage() {
  return <InstitutionAdminDashboardClient />;
}

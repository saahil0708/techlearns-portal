import React from 'react';
import type { Metadata } from 'next';
import InstitutionBatchesClient from '@/components/institution-admin/batches/InstitutionBatchesClient';

export const metadata: Metadata = {
  title: 'Academic Batches & Cohorts | CodePlatform Institution Admin',
  description: 'Manage institutional class cohorts, student rosters, and batch capacities.',
};

export const dynamic = 'force-dynamic';

export default function InstitutionBatchesPage() {
  return <InstitutionBatchesClient />;
}

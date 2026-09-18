import React from 'react';
import type { Metadata } from 'next';
import InstitutionAnalyticsClient from '@/components/institution-admin/analytics/InstitutionAnalyticsClient';

export const metadata: Metadata = {
  title: 'Institutional Analytics | CodePlatform Institution Admin',
  description: 'Campus-wide algorithmic performance analytics, problem solve rates, and cohort metrics.',
};

export const dynamic = 'force-dynamic';

export default function InstitutionAnalyticsPage() {
  return <InstitutionAnalyticsClient />;
}

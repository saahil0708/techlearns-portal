import React from 'react';
import type { Metadata } from 'next';
import InstitutionSettingsClient from '@/components/institution-admin/settings/InstitutionSettingsClient';

export const metadata: Metadata = {
  title: 'Campus Settings | CodePlatform Institution Admin',
  description: 'Manage institutional policies, domain whitelists, and campus details.',
};

export const dynamic = 'force-dynamic';

export default function InstitutionSettingsPage() {
  return <InstitutionSettingsClient />;
}

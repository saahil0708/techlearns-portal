import React from 'react';
import type { Metadata } from 'next';
import InstitutionFacultyClient from '@/components/institution-admin/faculty/InstitutionFacultyClient';

export const metadata: Metadata = {
  title: 'Faculty & Mentors | CodePlatform Institution Admin',
  description: 'Manage institutional faculty mentors, teaching assistants, and department coordinators.',
};

export const dynamic = 'force-dynamic';

export default function InstitutionFacultyPage() {
  return <InstitutionFacultyClient />;
}

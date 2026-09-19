import React from 'react';
import { Metadata } from 'next';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import CertificationsClient from '@/components/students/certifications/CertificationsClient';

export const metadata: Metadata = {
  title: 'Verified Certifications & Credentials | Techlearns SkillOS',
  description: 'Proctored coding skill assessments, verified credential badges, and verifiable certificates.',
};

export default function StudentCertificationsPage() {
  return (
    <StudentAppLayout>
      <CertificationsClient />
    </StudentAppLayout>
  );
}

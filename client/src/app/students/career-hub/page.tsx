import React from 'react';
import { Metadata } from 'next';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import CareerHubClient from '@/components/students/career-hub/CareerHubClient';

export const metadata: Metadata = {
  title: 'Career Hub & ATS Intelligence | Techlearns SkillOS',
  description: 'AI resume ATS scanner, recruiter search visibility spotlight, and career compensation benchmarks.',
};

export default function StudentCareerHubPage() {
  return (
    <StudentAppLayout>
      <CareerHubClient />
    </StudentAppLayout>
  );
}

import React from 'react';
import { Metadata } from 'next';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import PlacementsClient from '@/components/students/placements/PlacementsClient';

export const metadata: Metadata = {
  title: 'Campus Placements & Job Drives | Techlearns SkillOS',
  description: 'Apply for verified on-campus and partner recruitment drives with 1-click Skill Passport verification.',
};

export default function StudentPlacementsPage() {
  return (
    <StudentAppLayout>
      <PlacementsClient />
    </StudentAppLayout>
  );
}

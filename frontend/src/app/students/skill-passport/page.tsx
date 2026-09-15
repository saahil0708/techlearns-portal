import React from 'react';
import { Metadata } from 'next';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import SkillPassportClient from '@/components/students/skill-passport/SkillPassportClient';

export const metadata: Metadata = {
  title: 'Digital Skill Passport | Techlearns SkillOS',
  description: 'Cryptographically signed student skill transcripts, verified test pass ratings, and QR verification proof.',
};

export default function StudentSkillPassportPage() {
  return (
    <StudentAppLayout>
      <SkillPassportClient />
    </StudentAppLayout>
  );
}

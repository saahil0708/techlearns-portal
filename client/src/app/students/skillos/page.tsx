import React from 'react';
import { Metadata } from 'next';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import StudentSkillosClient from '@/components/students/skillos/StudentSkillosClient';

export const metadata: Metadata = {
  title: 'SkillOS™ Proctored Assessments | Institutional Testing Portal',
  description: 'Secure, AI-monitored institutional technical tests, coding mid-terms, and competitive evaluations.',
};

export default function StudentSkillosPage() {
  return (
    <StudentAppLayout>
      <StudentSkillosClient />
    </StudentAppLayout>
  );
}

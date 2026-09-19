import React from 'react';
import { Metadata } from 'next';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import BootcampsClient from '@/components/students/bootcamps/BootcampsClient';

export const metadata: Metadata = {
  title: 'Industry Bootcamps & Cohorts | Techlearns SkillOS',
  description: 'Live sprint bootcamps, masterclasses with industry leaders, and hands-on capstone project evaluations.',
};

export default function StudentBootcampsPage() {
  return (
    <StudentAppLayout>
      <BootcampsClient />
    </StudentAppLayout>
  );
}

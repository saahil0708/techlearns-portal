import React from 'react';
import { Metadata } from 'next';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import InterviewPrepClient from '@/components/students/interview-prep/InterviewPrepClient';

export const metadata: Metadata = {
  title: 'FAANG Interview Prep Hub | Techlearns SkillOS',
  description: 'Company-specific interview problem tracks, AI mock interview simulator, and behavioral question bank.',
};

export default function StudentInterviewPrepPage() {
  return (
    <StudentAppLayout>
      <InterviewPrepClient />
    </StudentAppLayout>
  );
}

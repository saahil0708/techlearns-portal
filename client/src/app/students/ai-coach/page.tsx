import React from 'react';
import { Metadata } from 'next';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import AICoachClient from '@/components/students/ai-coach/AICoachClient';

export const metadata: Metadata = {
  title: 'AI Learning Coach & Tutor | Techlearns SkillOS',
  description: '24/7 intelligent code mentor, weakness diagnosis, and customized algorithmic drills.',
};

export default function StudentAICoachPage() {
  return (
    <StudentAppLayout>
      <AICoachClient />
    </StudentAppLayout>
  );
}

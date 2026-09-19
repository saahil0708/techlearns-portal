import React from 'react';
import { Metadata } from 'next';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import SkillGraphClient from '@/components/students/skill-graph/SkillGraphClient';

export const metadata: Metadata = {
  title: 'Role Skill Graph | Techlearns SkillOS',
  description: 'Interactive competency graphs, skill trees, and prerequisite roadmaps tailored for engineering career tracks.',
};

export default function SkillGraphPage() {
  return (
    <StudentAppLayout>
      <SkillGraphClient />
    </StudentAppLayout>
  );
}

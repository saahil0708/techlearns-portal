import React from 'react';
import { Metadata } from 'next';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import ProjectsClient from '@/components/students/projects/ProjectsClient';

export const metadata: Metadata = {
  title: 'Project Workspace & Sandboxes | Techlearns SkillOS',
  description: 'Full stack capstones, cloud sandbox environments, and real-time project milestone evaluation.',
};

export default function StudentProjectsPage() {
  return (
    <StudentAppLayout>
      <ProjectsClient />
    </StudentAppLayout>
  );
}

import React from 'react';
import { Metadata } from 'next';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import SimulationsClient from '@/components/students/simulations/SimulationsClient';

export const metadata: Metadata = {
  title: 'Corporate Engineering Simulations | Techlearns SkillOS',
  description: 'Participate in simulated enterprise engineering sprints, submit pull requests, and receive Staff Engineer code reviews.',
};

export default function StudentSimulationsPage() {
  return (
    <StudentAppLayout>
      <SimulationsClient />
    </StudentAppLayout>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CreateProblemModal from '@/components/superadmin/problems/CreateProblemModal';
import { apiService } from '@/lib/api-service';
import { NewProblemData } from '@/types/problem';

export default function SuperadminCreateProblemPage() {
  const router = useRouter();

  const handleCreate = async (data: NewProblemData) => {
    await apiService.createProblem({
      ...data,
      statement: data.statement || data.statementMarkdown || '',
    });
    router.push('/superadmin/problems');
  };

  return (
    <CreateProblemModal
      open={true}
      onClose={() => router.push('/superadmin/problems')}
      onSubmit={handleCreate}
    />
  );
}

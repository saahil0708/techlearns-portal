'use client';

import React from 'react';
import { Box } from '@mui/material';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import CodeEditorWorkspace from '@/components/editor/CodeEditorWorkspace';

export default function PracticeCompilerClient() {
  return (
    <StudentAppLayout streakDays={48} contestRating={2380} ratingTier="Master">
      <Box sx={{ width: '100%' }}>
        <CodeEditorWorkspace initialLanguage="python" />
      </Box>
    </StudentAppLayout>
  );
}

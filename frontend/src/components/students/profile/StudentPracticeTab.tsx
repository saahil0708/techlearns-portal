'use client';

import React from 'react';
import { Box, Typography, Card } from '@mui/material';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import CodeEditorWorkspace from '@/components/editor/CodeEditorWorkspace';

export default function StudentPracticeTab() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Header Banner */}
      <Card
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: 'rgba(37, 99, 235, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
            }}
          >
            <TerminalRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
              Online Compiler & Code Playground
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
              Run Python, C++, Java, C, JavaScript, TypeScript, Go, and Rust with interactive standard I/O
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* 2. Professional Code Editor Component */}
      <CodeEditorWorkspace initialLanguage="python" />
    </Box>
  );
}

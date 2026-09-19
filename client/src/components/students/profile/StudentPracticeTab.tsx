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
          bgcolor: '#0F172A',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
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
              bgcolor: 'rgba(37, 99, 235, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38BDF8',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            <TerminalRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
              Online Compiler & Code Playground
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8' }}>
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

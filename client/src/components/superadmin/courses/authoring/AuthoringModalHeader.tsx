'use client';

import React from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import { LessonModality } from './types';

interface AuthoringModalHeaderProps {
  modality: LessonModality;
  isEditing: boolean;
  moduleTitle?: string;
  isBulkImportOpen: boolean;
  onToggleBulkImport: () => void;
  onClose: () => void;
}

export function AuthoringModalHeader({
  modality,
  isEditing,
  moduleTitle,
  isBulkImportOpen,
  onToggleBulkImport,
  onClose,
}: AuthoringModalHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            bgcolor:
              modality === 'reading'
                ? '#FAF5FF'
                : modality === 'quiz' || modality === 'msq'
                ? '#FEF3C7'
                : '#ECFDF5',
            color:
              modality === 'reading'
                ? '#0B1F3A'
                : modality === 'quiz' || modality === 'msq'
                ? '#D97706'
                : '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid currentColor',
          }}
        >
          {modality === 'reading' && <MenuBookRoundedIcon sx={{ fontSize: 22 }} />}
          {modality === 'quiz' && <QuizRoundedIcon sx={{ fontSize: 22 }} />}
          {modality === 'msq' && <CheckBoxRoundedIcon sx={{ fontSize: 22 }} />}
          {modality === 'code' && <CodeRoundedIcon sx={{ fontSize: 22 }} />}
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
            {isEditing ? 'Edit Submodule / Lesson' : 'Author New Submodule / Lesson'}
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 500 }}>
            {moduleTitle ? `Inside ${moduleTitle}` : 'Configure rich notes, single/multi choice quizzes, or coding sandbox.'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          size="small"
          onClick={onToggleBulkImport}
          startIcon={<FlashOnRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            bgcolor: isBulkImportOpen ? '#0B1F3A' : '#F1F5F9',
            color: isBulkImportOpen ? '#FFFFFF' : '#334155',
            fontWeight: 700,
            fontSize: '0.78rem',
            textTransform: 'none',
            borderRadius: '8px',
            px: 1.5,
            py: 0.6,
            '&:hover': {
              bgcolor: isBulkImportOpen ? '#17366E' : '#E2E8F0',
            },
          }}
        >
          {isBulkImportOpen ? 'Close Importer' : '⚡ Bulk Import'}
        </Button>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#94A3B8',
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
    </Box>
  );
}

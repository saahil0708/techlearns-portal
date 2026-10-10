'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import { SolutionLanguage, CustomSolution } from './types';

interface ProblemUploadSolutionModalProps {
  open: boolean;
  onClose: () => void;
  uploadLang: SolutionLanguage;
  onUploadLangChange: (lang: SolutionLanguage) => void;
  uploadCode: string;
  onUploadCodeChange: (code: string) => void;
  uploadApproachTitle: string;
  onUploadApproachTitleChange: (title: string) => void;
  uploadTimeComplexity: string;
  onUploadTimeComplexityChange: (tc: string) => void;
  uploadSpaceComplexity: string;
  onUploadSpaceComplexityChange: (sc: string) => void;
  uploadEditorialNotes: string;
  onUploadEditorialNotesChange: (notes: string) => void;
  isDragOver: boolean;
  onDragOverChange: (drag: boolean) => void;
  onFileRead: (file: File) => void;
  onSaveSolution: () => void;
}

export default function ProblemUploadSolutionModal({
  open,
  onClose,
  uploadLang,
  onUploadLangChange,
  uploadCode,
  onUploadCodeChange,
  uploadApproachTitle,
  onUploadApproachTitleChange,
  uploadTimeComplexity,
  onUploadTimeComplexityChange,
  uploadSpaceComplexity,
  onUploadSpaceComplexityChange,
  uploadEditorialNotes,
  onUploadEditorialNotesChange,
  isDragOver,
  onDragOverChange,
  onFileRead,
  onSaveSolution,
}: ProblemUploadSolutionModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudUploadRoundedIcon sx={{ color: '#0B1F3A' }} />
            Author & Save Reference Solution Draft
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Store local reference solution drafts in multiple programming languages for session previews and student hint baselines.
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Language selector chips */}
        <Box>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', mb: 1 }}>
            Target Programming Language:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[
              { id: 'cpp' as SolutionLanguage, label: 'C++' },
              { id: 'python' as SolutionLanguage, label: 'Python' },
              { id: 'java' as SolutionLanguage, label: 'Java' },
              { id: 'typescript' as SolutionLanguage, label: 'TypeScript' },
            ].map((l) => (
              <Chip
                key={l.id}
                label={l.label}
                clickable
                onClick={() => onUploadLangChange(l.id)}
                sx={{
                  fontWeight: 700,
                  bgcolor: uploadLang === l.id ? '#0B1F3A' : '#F1F5F9',
                  color: uploadLang === l.id ? '#FFFFFF' : '#475569',
                  border: '1px solid',
                  borderColor: uploadLang === l.id ? '#0B1F3A' : '#CBD5E1',
                  '&:hover': { bgcolor: uploadLang === l.id ? '#17366E' : '#E2E8F0' },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Complexity and metadata fields */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' }, gap: 1.5 }}>
          <TextField
            size="small"
            label="Approach Title"
            value={uploadApproachTitle}
            onChange={(e) => onUploadApproachTitleChange(e.target.value)}
            placeholder="e.g. Hash Map Single Pass, Dynamic Programming"
          />
          <TextField
            size="small"
            label="Time Complexity"
            value={uploadTimeComplexity}
            onChange={(e) => onUploadTimeComplexityChange(e.target.value)}
            placeholder="e.g. O(N)"
          />
          <TextField
            size="small"
            label="Space Complexity"
            value={uploadSpaceComplexity}
            onChange={(e) => onUploadSpaceComplexityChange(e.target.value)}
            placeholder="e.g. O(N) or O(1)"
          />
        </Box>

        {/* File Drag and Drop Zone */}
        <Box
          onDragOver={(e) => {
            e.preventDefault();
            onDragOverChange(true);
          }}
          onDragLeave={() => onDragOverChange(false)}
          onDrop={(e) => {
            e.preventDefault();
            onDragOverChange(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              onFileRead(e.dataTransfer.files[0]);
            }
          }}
          sx={{
            p: 2.5,
            border: '2px dashed',
            borderColor: isDragOver ? '#0B1F3A' : '#CBD5E1',
            bgcolor: isDragOver ? '#FAF5FF' : '#F8FAFC',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.cpp,.cc,.cxx,.py,.java,.ts,.js,.txt';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) onFileRead(file);
            };
            input.click();
          }}
        >
          <CloudUploadRoundedIcon sx={{ fontSize: 32, color: isDragOver ? '#0B1F3A' : '#94A3B8', mb: 0.5 }} />
          <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155' }}>
            Click to Browse or Drag & Drop Solution File
          </Typography>
          <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
            Supports .cpp, .py, .java, .ts source code files
          </Typography>
        </Box>

        {/* Code Editor Area */}
        <Box>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', mb: 0.5 }}>
            Optimal Solution Code ({uploadLang.toUpperCase()}):
          </Typography>
          <TextField
            multiline
            rows={10}
            fullWidth
            value={uploadCode}
            onChange={(e) => onUploadCodeChange(e.target.value)}
            placeholder={`// Write or paste optimal ${uploadLang} solution code here...`}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                fontSize: '0.85rem',
                bgcolor: '#0B0F19',
                color: '#F8FAFC',
                '& fieldset': { borderColor: '#1E293B' },
                '&:hover fieldset': { borderColor: '#334155' },
                '&.Mui-focused fieldset': { borderColor: '#0B1F3A' },
              },
            }}
          />
        </Box>

        {/* Editorial Notes Markdown */}
        <Box>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', mb: 0.5 }}>
            Editorial Explanation / Hints Markdown (Optional):
          </Typography>
          <TextField
            multiline
            rows={3}
            fullWidth
            value={uploadEditorialNotes}
            onChange={(e) => onUploadEditorialNotesChange(e.target.value)}
            placeholder="Explain the intuition, edge cases, and algorithmic breakdown..."
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.85rem',
                bgcolor: '#F8FAFC',
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: '#64748B', fontWeight: 700 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSaveSolution}
          sx={{
            bgcolor: '#0B1F3A',
            fontWeight: 800,
            textTransform: 'none',
            px: 3,
            borderRadius: '8px',
            '&:hover': { bgcolor: '#17366E' },
          }}
        >
          Save Solution Draft
        </Button>
      </DialogActions>
    </Dialog>
  );
}

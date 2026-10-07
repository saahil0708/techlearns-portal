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
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { useToast } from '@/context/ToastContext';

interface ProblemViewCodeModalProps {
  open: boolean;
  onClose: () => void;
  activeCodeSnippet: { student: string; lang: string; code: string; verdict: string } | null;
}

export default function ProblemViewCodeModal({
  open,
  onClose,
  activeCodeSnippet,
}: ProblemViewCodeModalProps) {
  const toast = useToast();

  const getExt = (lang?: string) => {
    const l = (lang || '').toLowerCase().trim();
    if (l === 'javascript' || l === 'js' || l.startsWith('javascript') || l.startsWith('node')) return 'js';
    if (l === 'typescript' || l === 'ts' || l.startsWith('typescript')) return 'ts';
    if (l === 'python' || l === 'py' || l.startsWith('python') || l.startsWith('cpython')) return 'py';
    if (l === 'java' || l.startsWith('java') || l.startsWith('openjdk')) return 'java';
    if (l === 'c++' || l === 'cpp' || l === 'c' || l.startsWith('c++') || l.startsWith('gcc') || l.startsWith('clang')) return 'cpp';
    if (l === 'go' || l === 'golang') return 'go';
    if (l === 'rust' || l === 'rs') return 'rs';
    return 'cpp';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
            {activeCodeSnippet?.student}&apos;s Submission
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Language: {activeCodeSnippet?.lang} • Verdict: {activeCodeSnippet?.verdict}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '16px !important', px: 3 }}>
        <Box
          sx={{
            borderRadius: '14px',
            bgcolor: '#0B0F19',
            border: '1px solid #1E293B',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1,
              bgcolor: '#111827',
              borderBottom: '1px solid #1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.75 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#EF4444' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981' }} />
              </Box>
              <Typography
                className="ide-code-font"
                sx={{
                  fontSize: '0.74rem',
                  color: '#94A3B8',
                  fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace !important',
                  ml: 1,
                  fontWeight: 700,
                }}
              >
                submission_solution.{getExt(activeCodeSnippet?.lang)}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={activeCodeSnippet?.lang || 'Code'}
              sx={{
                fontSize: '0.7rem',
                fontWeight: 700,
                height: 20,
                bgcolor: 'rgba(56, 189, 248, 0.15)',
                color: '#38BDF8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            />
          </Box>

          <Box
            className="ide-code-font"
            sx={{
              p: 2.5,
              fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace !important',
              fontSize: '0.84rem',
              lineHeight: 1.65,
              maxHeight: '55vh',
              overflowY: 'auto',
              display: 'flex',
              gap: 2,
            }}
          >
            {/* Line Numbers */}
            <Box
              sx={{
                userSelect: 'none',
                textAlign: 'right',
                color: '#475569',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                lineHeight: 'inherit',
                pr: 1.5,
                borderRight: '1px solid #1E293B',
              }}
            >
              {(activeCodeSnippet?.code || '').split('\n').map((_, idx) => (
                <div key={idx}>{idx + 1}</div>
              ))}
            </Box>
            {/* Code Content */}
            <Box
              sx={{
                flex: 1,
                color: '#F8FAFC',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                lineHeight: 'inherit',
                overflowX: 'auto',
                whiteSpace: 'pre',
              }}
            >
              {activeCodeSnippet?.code}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={() => {
            if (activeCodeSnippet?.code) {
              navigator.clipboard.writeText(activeCodeSnippet.code);
              toast.success('Code copied to clipboard', 'Copied');
            }
          }}
          startIcon={<ContentCopyRoundedIcon />}
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
        >
          Copy Code
        </Button>
        <Button onClick={onClose} sx={{ fontWeight: 700 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

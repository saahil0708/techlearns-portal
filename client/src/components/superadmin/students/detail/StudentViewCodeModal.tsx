'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import { StudentSubmissionItem } from './types';

interface StudentViewCodeModalProps {
  submission: StudentSubmissionItem | null;
  onClose: () => void;
}

export default function StudentViewCodeModal({
  submission,
  onClose,
}: StudentViewCodeModalProps) {
  if (!submission) return null;

  return (
    <Dialog
      open={Boolean(submission)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { borderRadius: '18px', width: '100%', maxWidth: 640, p: 1 },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
        <TerminalRoundedIcon sx={{ color: '#0B1F3A', fontSize: 22 }} />
        <span>{submission.problemTitle}</span>
        <Chip label={submission.language} size="small" sx={{ ml: 'auto', fontWeight: 700 }} />
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: '24px !important', pb: 2.5 }}>
        <Box sx={{ p: 2, bgcolor: '#0F172A', color: '#F8FAFC', borderRadius: '10px', fontFamily: 'monospace', fontSize: '0.82rem', overflowX: 'auto' }}>
          <pre style={{ margin: 0 }}>{submission.codeSnippet}</pre>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
            Verdict: <strong style={{ color: submission.verdict === 'Accepted' ? '#16A34A' : '#EF4444' }}>{submission.verdict}</strong>
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
            Runtime: <strong>{submission.runtimeMs} ms</strong> • Memory: <strong>{submission.memoryKb} KB</strong>
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: '#0B1F3A', fontWeight: 700 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

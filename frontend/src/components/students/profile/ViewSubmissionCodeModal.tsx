'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { StudentSubmission } from '@/types/student-profile';
import { useToast } from '@/context/ToastContext';

interface ViewSubmissionCodeModalProps {
  open: boolean;
  submission: StudentSubmission | null;
  onClose: () => void;
}

export default function ViewSubmissionCodeModal({
  open,
  submission,
  onClose,
}: ViewSubmissionCodeModalProps) {
  const toast = useToast();

  if (!submission) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
            {submission.problemTitle}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Language: {submission.language} • Verdict: {submission.verdict} • Runtime: {submission.runtimeMs}ms
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '16px !important' }}>
        <Box
          sx={{
            p: 2.5,
            bgcolor: '#0B0F19',
            color: '#38BDF8',
            borderRadius: '12px',
            fontFamily: 'monospace',
            fontSize: '0.86rem',
            maxHeight: '60vh',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
          }}
        >
          {submission.codeSnippet}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={() => {
            if (submission.codeSnippet) {
              navigator.clipboard.writeText(submission.codeSnippet);
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

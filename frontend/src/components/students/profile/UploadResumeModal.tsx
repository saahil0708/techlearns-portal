'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useToast } from '@/context/ToastContext';

interface UploadResumeModalProps {
  open: boolean;
  currentResumeName?: string;
  onClose: () => void;
  onUpload: (fileName: string) => void;
}

export default function UploadResumeModal({
  open,
  currentResumeName,
  onClose,
  onUpload,
}: UploadResumeModalProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile && !currentResumeName) return;
    const name = selectedFile ? selectedFile.name : (currentResumeName || 'Resume.pdf');
    onUpload(name);
    toast.success(`Resume "${name}" uploaded successfully.`, 'Resume Saved');
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            p: 1,
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.16)',
            border: '1px solid #E2E8F0',
          },
        },
      }}
    >
      <Box sx={{ position: 'relative', pt: 2, px: 3, pb: 0.5 }}>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', right: 16, top: 16, color: '#94A3B8' }}
        >
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
          Upload Your Resume
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748B' }}>
          Supported formats: PDF, DOCX (Max 10MB)
        </Typography>
      </Box>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <Box
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          sx={{
            p: 3,
            borderRadius: '16px',
            border: isDragging ? '2px dashed #2563EB' : '2px dashed #CBD5E1',
            bgcolor: isDragging ? '#EFF6FF' : '#F8FAFC',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#2563EB',
              bgcolor: '#EFF6FF',
            },
          }}
        >
          {selectedFile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 36, color: '#16A34A' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                {selectedFile.name}
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563EB',
                }}
              >
                <UploadFileRoundedIcon sx={{ fontSize: 26 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                Click to browse or drag and drop
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                Used for platform job applications & university recruitments
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, px: 3, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: '#64748B', fontWeight: 700 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedFile}
          sx={{
            bgcolor: '#2563EB',
            fontWeight: 800,
            textTransform: 'none',
            borderRadius: '10px',
            px: 2.5,
            '&:hover': { bgcolor: '#1D4ED8' },
          }}
        >
          Upload Resume
        </Button>
      </DialogActions>
    </Dialog>
  );
}

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
  Avatar,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import Link from 'next/link';
import { StudentDirectoryEntity } from '@/components/superadmin/students/StudentsDirectoryClient';

interface CompareStudentsModalProps {
  open: boolean;
  onClose: () => void;
  selectedStudents: StudentDirectoryEntity[];
}

export default function CompareStudentsModal({
  open,
  onClose,
  selectedStudents,
}: CompareStudentsModalProps) {
  if (selectedStudents.length < 2) return null;

  const borderColor = '#E2E8F0';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            color: '#0F172A',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '20px 28px',
          borderBottom: `1px solid ${borderColor}`,
          bgcolor: '#F8FAFC',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '9999px',
              bgcolor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #BFDBFE',
            }}
          >
            <CompareArrowsRoundedIcon sx={{ color: '#2563EB', fontSize: '1.3rem' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
              Head-to-Head Coder Comparison
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem' }}>
              Comparing metrics across {selectedStudents.length} selected competitive programmers
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#64748B',
            borderRadius: '9999px',
            '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3.5, pt: '28px !important', pb: 3.5, overflowY: 'auto', maxHeight: '75vh', bgcolor: '#F8FAFC' }}>
        {/* Header Coders Row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${selectedStudents.length}, 1fr)`,
            gap: 2.5,
            mb: 3,
          }}
        >
          {selectedStudents.map((stu) => (
            <Box
              key={stu.id}
              sx={{
                p: '20px',
                borderRadius: '16px',
                bgcolor: '#FFFFFF',
                border: `1px solid ${borderColor}`,
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              {/* Rank Pill */}
              <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                <Chip
                  icon={<EmojiEventsRoundedIcon sx={{ fontSize: '0.9rem !important', color: '#D97706 !important' }} />}
                  label={`Rank #${stu.globalRank}`}
                  size="small"
                  sx={{
                    bgcolor: '#FFFBEB',
                    color: '#D97706',
                    border: '1px solid #FDE68A',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    borderRadius: '9999px',
                  }}
                />
              </Box>

              <Avatar
                src={stu.avatarUrl}
                sx={{
                  width: 60,
                  height: 60,
                  mx: 'auto',
                  mb: 1.5,
                  bgcolor: stu.avatarColor,
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  border: '3px solid #BFDBFE',
                }}
              >
                {stu.name.charAt(0)}
              </Avatar>

              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                {stu.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#2563EB', fontSize: '0.8rem', mb: 1, fontFamily: 'monospace', fontWeight: 600 }}>
                @{stu.handle}
              </Typography>

              <Chip
                label={stu.institutionName}
                size="small"
                sx={{
                  bgcolor: '#F1F5F9',
                  color: '#475569',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  maxWidth: '100%',
                  borderRadius: '9999px',
                }}
              />

              <Box sx={{ mt: 2 }}>
                <Link href={`/superadmin/students/${stu.id}`} passHref style={{ textDecoration: 'none' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{
                      borderRadius: '9999px',
                      borderColor: '#BFDBFE',
                      color: '#2563EB',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#2563EB',
                        bgcolor: '#EFF6FF',
                      },
                    }}
                  >
                    View Full Profile
                  </Button>
                </Link>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Metric Comparison Sections */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Total Problems Solved Breakdown */}
          <Box
            sx={{
              p: '20px',
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CodeRoundedIcon sx={{ color: '#2563EB', fontSize: '1.1rem' }} />
                Problems Solved Breakdown (Easy / Medium / Hard)
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${selectedStudents.length}, 1fr)`, gap: 2.5 }}>
              {selectedStudents.map((stu) => (
                <Box key={stu.id}>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', mb: 1.2 }}>
                    {stu.problemsSolved}{' '}
                    <Typography component="span" sx={{ color: '#64748B', fontSize: '0.78rem', fontWeight: 500 }}>
                      solved total
                    </Typography>
                  </Typography>

                  {/* Multi-segment bar */}
                  <Box
                    sx={{
                      display: 'flex',
                      height: 10,
                      borderRadius: '9999px',
                      overflow: 'hidden',
                      bgcolor: '#F1F5F9',
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ width: `${(stu.solvedEasy / (stu.problemsSolved || 1)) * 100}%`, bgcolor: '#16A34A' }} />
                    <Box sx={{ width: `${(stu.solvedMedium / (stu.problemsSolved || 1)) * 100}%`, bgcolor: '#D97706' }} />
                    <Box sx={{ width: `${(stu.solvedHard / (stu.problemsSolved || 1)) * 100}%`, bgcolor: '#DC2626' }} />
                  </Box>

                  {/* Solved pills */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      size="small"
                      label={`Easy: ${stu.solvedEasy}`}
                      sx={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        bgcolor: '#F0FDF4',
                        color: '#16A34A',
                        borderRadius: '9999px',
                        border: '1px solid #BBF7D0',
                      }}
                    />
                    <Chip
                      size="small"
                      label={`Med: ${stu.solvedMedium}`}
                      sx={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        bgcolor: '#FFFBEB',
                        color: '#D97706',
                        borderRadius: '9999px',
                        border: '1px solid #FDE68A',
                      }}
                    />
                    <Chip
                      size="small"
                      label={`Hard: ${stu.solvedHard}`}
                      sx={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        bgcolor: '#FEF2F2',
                        color: '#DC2626',
                        borderRadius: '9999px',
                        border: '1px solid #FECACA',
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Accuracy & Consistency Streaks */}
          <Box
            sx={{
              p: '20px',
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.9rem', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WhatshotRoundedIcon sx={{ color: '#D97706', fontSize: '1.1rem' }} />
              Accuracy & Daily Active Streak
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${selectedStudents.length}, 1fr)`, gap: 2.5 }}>
              {selectedStudents.map((stu) => (
                <Box
                  key={stu.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.2,
                    p: '14px',
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#64748B', fontSize: '0.78rem' }}>Submission Accuracy:</Typography>
                    <Typography sx={{ color: '#16A34A', fontWeight: 800, fontSize: '0.85rem' }}>{stu.accuracy}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: '#E2E8F0' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#64748B', fontSize: '0.78rem' }}>Daily Active Streak:</Typography>
                    <Typography sx={{ color: '#D97706', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <WhatshotRoundedIcon sx={{ fontSize: '0.9rem' }} />
                      {stu.streakDays} Days
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: '16px 28px',
          borderTop: `1px solid ${borderColor}`,
          bgcolor: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="caption" sx={{ color: '#64748B' }}>
          * Rankings, ratings & accuracy are computed in real time across the platform.
        </Typography>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: '9999px',
            bgcolor: '#2563EB',
            px: 3,
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { bgcolor: '#1D4ED8' },
          }}
        >
          Close Comparison
        </Button>
      </DialogActions>
    </Dialog>
  );
}

'use client';

import React from 'react';
import { Box, Typography, Card, Chip } from '@mui/material';
import { CareerTrack, DiagnosticQuestion } from './types';

interface CalibrationQuizStepProps {
  activeTrackObj: CareerTrack;
  questionsForTrack: DiagnosticQuestion[];
  quizAnswers: Record<string, string>;
  onSelectAnswer: (questionId: string, optionKey: string) => void;
}

export function CalibrationQuizStep({
  activeTrackObj,
  questionsForTrack,
  quizAnswers,
  onSelectAnswer,
}: CalibrationQuizStepProps) {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
          {activeTrackObj.title} — Diagnostic Calibration Quiz
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          Answer these 3 conceptual questions to calibrate your knowledge baseline and unlock targeted course recommendations.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {questionsForTrack.map((q, qIndex) => {
          const selectedOption = quizAnswers[q.id];
          return (
            <Card
              key={q.id}
              sx={{
                p: 3,
                borderRadius: '14px',
                border: '1.5px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`Question ${qIndex + 1} of ${questionsForTrack.length}`}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      bgcolor: '#FAF5FF',
                      color: '#0B1F3A',
                      fontSize: '0.75rem',
                      border: '1px solid #FAF5FF',
                    }}
                  />
                  <Chip
                    label={q.difficulty}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      bgcolor:
                        q.difficulty === 'Easy'
                          ? '#ECFDF5'
                          : q.difficulty === 'Medium'
                          ? '#FFFBEB'
                          : '#FEF2F2',
                      color:
                        q.difficulty === 'Easy'
                          ? '#059669'
                          : q.difficulty === 'Medium'
                          ? '#D97706'
                          : '#DC2626',
                      border: '1px solid',
                      borderColor:
                        q.difficulty === 'Easy'
                          ? '#A7F3D0'
                          : q.difficulty === 'Medium'
                          ? '#FDE68A'
                          : '#FECACA',
                    }}
                  />
                </Box>
              </Box>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 2, fontSize: '0.95rem' }}>
                {q.question}
              </Typography>

              <Box role="radiogroup" aria-label={q.question} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {q.options.map((opt) => {
                  const isChosen = selectedOption === opt.key;
                  return (
                    <Box
                      key={opt.key}
                      role="radio"
                      aria-checked={isChosen}
                      tabIndex={0}
                      onClick={() => onSelectAnswer(q.id, opt.key)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectAnswer(q.id, opt.key);
                        }
                      }}
                      sx={{
                        p: 1.8,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        border: isChosen ? '2px solid #0B1F3A' : '1.5px solid #E2E8F0',
                        bgcolor: isChosen ? '#FAF5FF' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        transition: 'all 0.15s ease',
                        outline: 'none',
                        '&:focus-visible': {
                          boxShadow: '0 0 0 3px rgba(11, 31, 58, 0.35)',
                        },
                        '&:hover': {
                          bgcolor: isChosen ? '#FAF5FF' : '#F8FAFC',
                          borderColor: isChosen ? '#0B1F3A' : '#C084FC',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          bgcolor: isChosen ? '#0B1F3A' : '#F1F5F9',
                          color: isChosen ? '#FFFFFF' : '#475569',
                          border: isChosen ? 'none' : '1px solid #CBD5E1',
                        }}
                      >
                        {opt.key}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: isChosen ? '#0B1F3A' : '#334155',
                          fontWeight: isChosen ? 700 : 500,
                          fontSize: '0.88rem',
                        }}
                      >
                        {opt.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}

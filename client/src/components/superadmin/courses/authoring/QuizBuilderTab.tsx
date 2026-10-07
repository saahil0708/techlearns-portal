'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Radio,
  Checkbox,
} from '@mui/material';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { LessonModality } from './types';

interface QuizBuilderTabProps {
  modality: LessonModality;
  quizQuestion: string;
  setQuizQuestion: (q: string) => void;
  quizOptions: string[];
  setQuizOptions: (opts: string[]) => void;
  mcqCorrectIndex: number;
  setMcqCorrectIndex: (idx: number) => void;
  msqCorrectIndices: number[];
  setMsqCorrectIndices: (idxs: number[] | ((prev: number[]) => number[])) => void;
  quizExplanation: string;
  setQuizExplanation: (exp: string) => void;
  quizHint: string;
  setQuizHint: (hint: string) => void;
  quizPoints?: number;
  setQuizPoints?: (points: number) => void;
  borderColor: string;
}

export function QuizBuilderTab({
  modality,
  quizQuestion,
  setQuizQuestion,
  quizOptions,
  setQuizOptions,
  mcqCorrectIndex,
  setMcqCorrectIndex,
  msqCorrectIndices,
  setMsqCorrectIndices,
  quizExplanation,
  setQuizExplanation,
  quizHint,
  setQuizHint,
  quizPoints,
  setQuizPoints,
  borderColor,
}: QuizBuilderTabProps) {
  const handleAddQuizOption = () => {
    setQuizOptions([...quizOptions, '']);
  };

  const handleRemoveQuizOption = (index: number) => {
    if (quizOptions.length <= 2) return;
    const next = quizOptions.filter((_, i) => i !== index);
    setQuizOptions(next);
    if (mcqCorrectIndex === index) {
      setMcqCorrectIndex(0);
    } else if (mcqCorrectIndex > index) {
      setMcqCorrectIndex(mcqCorrectIndex - 1);
    }
    setMsqCorrectIndices((prev) => prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)));
  };

  const handleToggleMsqIndex = (index: number) => {
    setMsqCorrectIndices((prev) => {
      if (prev.includes(index)) {
        if (prev.length === 1) return prev;
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index].sort((a, b) => a - b);
      }
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Question Statement */}
      <Box>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
          Quiz Question Statement <span style={{ color: '#EF4444' }}>*</span>
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="e.g. Which of the following data structures provides O(1) average lookup time?"
          value={quizQuestion}
          onChange={(e) => setQuizQuestion(e.target.value)}
          slotProps={{
            input: {
              sx: {
                borderRadius: '10px',
                fontSize: '0.88rem',
                bgcolor: '#F8FAFC',
                '& fieldset': { borderColor: borderColor },
                '&:hover fieldset': { borderColor: '#CBD5E1' },
                '&.Mui-focused fieldset': { borderColor: '#2563EB' },
              },
            },
          }}
        />
      </Box>

      {/* Options Builder */}
      <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: '14px', border: `1px solid ${borderColor}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
            Answer Options ({modality === 'quiz' ? 'Select single correct radio' : 'Select all correct checkboxes'})
          </Typography>
          <Button
            size="small"
            onClick={handleAddQuizOption}
            startIcon={<AddCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', color: '#2563EB' }}
          >
            Add Option
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {quizOptions.map((opt, oIdx) => {
            const isCorrect =
              modality === 'quiz' ? mcqCorrectIndex === oIdx : msqCorrectIndices.includes(oIdx);

            return (
              <Box
                key={oIdx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: isCorrect ? '#F0FDF4' : '#FFFFFF',
                  border: isCorrect ? '1px solid #86EFAC' : `1px solid ${borderColor}`,
                  borderRadius: '10px',
                  p: 0.75,
                  transition: 'all 0.15s ease',
                }}
              >
                {modality === 'quiz' ? (
                  <Radio
                    checked={mcqCorrectIndex === oIdx}
                    onChange={() => setMcqCorrectIndex(oIdx)}
                    sx={{ color: '#94A3B8', '&.Mui-checked': { color: '#16A34A' } }}
                  />
                ) : (
                  <Checkbox
                    checked={msqCorrectIndices.includes(oIdx)}
                    onChange={() => handleToggleMsqIndex(oIdx)}
                    sx={{ color: '#94A3B8', '&.Mui-checked': { color: '#16A34A' } }}
                  />
                )}

                <TextField
                  fullWidth
                  size="small"
                  placeholder={`Option ${String.fromCharCode(65 + oIdx)}...`}
                  value={opt}
                  onChange={(e) => {
                    const next = [...quizOptions];
                    next[oIdx] = e.target.value;
                    setQuizOptions(next);
                  }}
                  slotProps={{
                    input: {
                      sx: {
                        borderRadius: '8px',
                        fontSize: '0.86rem',
                        bgcolor: 'transparent',
                      },
                    },
                  }}
                />

                <IconButton
                  size="small"
                  onClick={() => handleRemoveQuizOption(oIdx)}
                  disabled={quizOptions.length <= 2}
                  sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}
                >
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Solution Explanation & Hints */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
            Detailed Solution Explanation
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Provide a step-by-step reason why the selected choice is correct..."
            value={quizExplanation}
            onChange={(e) => setQuizExplanation(e.target.value)}
            slotProps={{
              input: {
                sx: {
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  bgcolor: '#F8FAFC',
                },
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              Student Hint (Optional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Think about hash collision mechanics and bucket indices..."
              value={quizHint}
              onChange={(e) => setQuizHint(e.target.value)}
              slotProps={{
                input: {
                  sx: {
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    bgcolor: '#F8FAFC',
                  },
                },
              }}
            />
          </Box>

          {setQuizPoints && (
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                Award Points
              </Typography>
              <TextField
                type="number"
                fullWidth
                size="small"
                value={quizPoints ?? 10}
                onChange={(e) => setQuizPoints(Math.max(1, Number(e.target.value) || 0))}
                slotProps={{
                  input: {
                    sx: {
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      bgcolor: '#F8FAFC',
                    },
                  },
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

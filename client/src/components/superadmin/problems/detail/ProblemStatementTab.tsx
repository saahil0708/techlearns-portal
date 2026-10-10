'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import { ProblemEntity } from '@/types/problem';
import { SolutionLanguage, CustomSolution } from './types';
import { useToast } from '@/context/ToastContext';
import ProblemStatementDisplay from '@/components/problems/ProblemStatementDisplay';

interface ProblemStatementTabProps {
  problem: ProblemEntity;
  editorialMarkdown: string;
  editorialLang: SolutionLanguage;
  onEditorialLangChange: (lang: SolutionLanguage) => void;
  customSolutions: Record<string, CustomSolution>;
  onOpenUploadModal: (lang?: SolutionLanguage) => void;
  getEditorialSolution: (lang: SolutionLanguage) => CustomSolution;
  renderInlineFormatted: (text: string) => React.ReactNode;
}

export default function ProblemStatementTab({
  problem,
  editorialMarkdown,
  editorialLang,
  onEditorialLangChange,
  customSolutions,
  onOpenUploadModal,
  getEditorialSolution,
  renderInlineFormatted,
}: ProblemStatementTabProps) {
  const toast = useToast();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1.35fr 1fr' },
        alignItems: 'start',
        gap: 2.5,
      }}
    >
      {/* Left Card: Problem Statement & Constraints */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: { xs: 2.5, sm: 3 } }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 2, fontSize: '1.05rem' }}>
            Problem Statement
          </Typography>

          {/* Formatted Problem Statement (Rich HTML + Markdown support) */}
          <Box
            sx={{
              p: 2.5,
              bgcolor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
            }}
          >
            <ProblemStatementDisplay content={problem.statementMarkdown} />
          </Box>

          {problem.constraints && (
            <Box sx={{ mt: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1, fontSize: '0.92rem' }}>
                Constraints & Complexity Specifications
              </Typography>
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#475569', fontSize: '0.86rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {renderInlineFormatted(problem.constraints)}
              </Box>
            </Box>
          )}
        </Card>
      </Box>

      {/* Right Card: Editorial with Multi-Language Code View & Upload Option */}
      <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: { xs: 2.5, sm: 3 } }}>
        {/* Card Header with Upload Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1.5, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 1 }}>
              Editorial & Optimal Code
              <Chip
                size="small"
                label="Editorial Draft"
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  height: 20,
                  bgcolor: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                }}
              />
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '0.8rem', mt: 0.25 }}>
              Reference solution drafts and hints configured for preview & testing in this session.
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="small"
            startIcon={<CloudUploadRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={() => onOpenUploadModal(editorialLang)}
            sx={{
              bgcolor: '#0B1F3A',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.78rem',
              textTransform: 'none',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(91, 45, 144, 0.2)',
              '&:hover': { bgcolor: '#17366E' },
            }}
          >
            Upload Solution Draft
          </Button>
        </Box>

        {/* Editorial explanation if present */}
        {editorialMarkdown && (
          <Box sx={{ p: 2, mb: 2, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <Typography sx={{ color: '#475569', fontSize: '0.84rem', lineHeight: 1.6 }}>
              {renderInlineFormatted(editorialMarkdown)}
            </Typography>
          </Box>
        )}

        {/* Approach & Complexity Chips */}
        {(() => {
          const currentSol = getEditorialSolution(editorialLang);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
              {currentSol.approachTitle && (
                <Chip
                  size="small"
                  label={currentSol.approachTitle}
                  sx={{
                    bgcolor: '#F1F5F9',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    border: '1px solid #E2E8F0',
                  }}
                />
              )}
              <Chip
                size="small"
                label={`Time: ${currentSol.timeComplexity || 'O(1)'}`}
                sx={{
                  bgcolor: '#FAF5FF',
                  color: '#0B1F3A',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  border: '1px solid #FAF5FF',
                }}
              />
              <Chip
                size="small"
                label={`Space: ${currentSol.spaceComplexity || 'O(1)'}`}
                sx={{
                  bgcolor: '#F5F3FF',
                  color: '#7C3AED',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  border: '1px solid #DDD6FE',
                }}
              />
            </Box>
          );
        })()}

        {/* Multi-Language Selector Tabs with indicators */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            {[
              { id: 'cpp' as SolutionLanguage, label: 'C++' },
              { id: 'python' as SolutionLanguage, label: 'Python' },
              { id: 'java' as SolutionLanguage, label: 'Java' },
              { id: 'typescript' as SolutionLanguage, label: 'TypeScript' },
            ].map((l) => {
              const isCustom = Boolean(customSolutions[l.id]);
              return (
                <Button
                  key={l.id}
                  size="small"
                  onClick={() => onEditorialLangChange(l.id)}
                  sx={{
                    px: 1.35,
                    py: 0.35,
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    minWidth: 'auto',
                    bgcolor: editorialLang === l.id ? '#0B1F3A' : '#F1F5F9',
                    color: editorialLang === l.id ? '#FFFFFF' : '#475569',
                    border: '1px solid',
                    borderColor: editorialLang === l.id ? '#0B1F3A' : '#E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    '&:hover': {
                      bgcolor: editorialLang === l.id ? '#17366E' : '#E2E8F0',
                    },
                  }}
                >
                  {l.label}
                  {isCustom && (
                    <Box
                      component="span"
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: editorialLang === l.id ? '#86EFAC' : '#10B981',
                      }}
                    />
                  )}
                </Button>
              );
            })}
          </Box>

          <Button
            size="small"
            startIcon={<EditRoundedIcon sx={{ fontSize: 13 }} />}
            onClick={() => onOpenUploadModal(editorialLang)}
            sx={{
              fontSize: '0.72rem',
              color: '#64748B',
              textTransform: 'none',
              fontWeight: 600,
              py: 0.2,
              px: 0.75,
              borderRadius: '6px',
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            }}
          >
            Edit Active
          </Button>
        </Box>

        {/* IDE Code Viewer */}
        {(() => {
          const sol = getEditorialSolution(editorialLang);
          return (
            <Box
              sx={{
                borderRadius: '12px',
                overflow: 'hidden',
                bgcolor: '#0B0F19',
                border: '1px solid #1E293B',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
              }}
            >
              {/* IDE Tab Header */}
              <Box
                sx={{
                  px: 2,
                  py: 1.25,
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
                    {sol.filename} • {sol.displayLang}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => {
                    if (sol.code) {
                      navigator.clipboard.writeText(sol.code);
                      toast.success(`${sol.displayLang} code copied!`, 'Copied');
                    }
                  }}
                  sx={{
                    fontSize: '0.72rem',
                    color: '#C084FC',
                    textTransform: 'none',
                    fontWeight: 700,
                    py: 0.25,
                    px: 1,
                  }}
                >
                  Copy
                </Button>
              </Box>

              {/* IDE Code Lines */}
              <Box
                className="ide-code-font"
                sx={{
                  p: 2,
                  fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace !important',
                  fontSize: '0.82rem',
                  lineHeight: 1.6,
                  color: '#F8FAFC',
                  overflowX: 'auto',
                }}
              >
                <pre style={{ margin: 0, fontFamily: 'inherit' }}>
                  <code style={{ fontFamily: 'inherit' }}>{sol.code}</code>
                </pre>
              </Box>
            </Box>
          );
        })()}
      </Card>
    </Box>
  );
}

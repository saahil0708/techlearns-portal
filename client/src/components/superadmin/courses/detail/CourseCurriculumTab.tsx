'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import Link from 'next/link';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { FluidArrowRight, FluidArrowUpward, FluidArrowDownward } from '@/utils/fluid_arrow';
import type { CourseDirectoryEntity } from '@/types/course';
import type { TopicItem } from './types';
import { getModuleTopicItems, getBadgeForType } from './courseCatalogFallback';
import { useToast } from '@/context/ToastContext';

interface CourseCurriculumTabProps {
  course: CourseDirectoryEntity;
  displayModules: any[];
  expandedModules: Record<number, boolean>;
  onToggleModule: (idx: number) => void;
  moduleTopicMap: Record<number, TopicItem[]>;
  isStudent?: boolean;
  isStudioMode?: boolean;
  courseCompletionPct: number;
  completedCount: number;
  allSubmoduleItems: TopicItem[];
  onOpenAddModule: () => void;
  onOpenEditModule: (mod: any, idx: number) => void;
  onOpenAddLesson: (mod: any, idx: number) => void;
  onOpenEditLesson: (lesson: TopicItem, mod: any, modIdx: number) => void;
  onReorderModule: (idx: number, dir: 'up' | 'down') => void;
  onDeleteModule: (idx: number, id?: string) => void;
  onDeleteLesson: (lessonId: string, modIdx: number) => void;
  onEnrollOrStart: (firstLessonKey: string) => void;
  isEnrolling?: boolean;
  isModuleUnlocked: (idx: number) => boolean;
  onBulkImport?: () => void;
  onEditOutcomes?: () => void;
}

export default function CourseCurriculumTab({
  course,
  displayModules,
  expandedModules,
  onToggleModule,
  moduleTopicMap,
  isStudent = false,
  isStudioMode = false,
  courseCompletionPct,
  completedCount,
  allSubmoduleItems,
  onOpenAddModule,
  onOpenEditModule,
  onOpenAddLesson,
  onOpenEditLesson,
  onReorderModule,
  onDeleteModule,
  onDeleteLesson,
  onEnrollOrStart,
  isEnrolling = false,
  isModuleUnlocked,
  onBulkImport,
  onEditOutcomes,
}: CourseCurriculumTabProps) {
  const toast = useToast();

  const getModuleProblemsCount = (mod: any, idx: number, topics: TopicItem[]) => {
    let count = 0;
    if (topics && topics.length > 0) {
      for (const t of topics) {
        if (Array.isArray(t.problems) && t.problems.length > 0) {
          count += t.problems.length;
        } else if (t.codingProblem || t.type === 'lab') {
          count += 1;
        }
      }
    } else if (Array.isArray(mod?.lessons) && mod.lessons.length > 0) {
      for (const l of mod.lessons) {
        if (Array.isArray(l.problems) && l.problems.length > 0) {
          count += l.problems.length;
        } else if (l.codingProblem || l.type === 'lab') {
          count += 1;
        }
      }
    }
    return count;
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '20px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        p: { xs: 2.5, sm: 3, md: 3.5 },
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.02)',
      }}
    >
      {/* Curriculum Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.25rem' }}>
            Course Curriculum & Modular Units
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.85rem', mt: 0.25 }}>
            Structured sequential lessons, hands-on coding sandboxes, and milestone assessments.
          </Typography>
        </Box>

        {!isStudent && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {onEditOutcomes && (
              <Button
                variant="outlined"
                size="small"
                onClick={onEditOutcomes}
                sx={{
                  borderRadius: '9999px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  px: 2,
                  py: 0.75,
                  borderColor: '#E2E8F0',
                  color: '#475569',
                  '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
                }}
              >
                Edit Outcomes
              </Button>
            )}
            {onBulkImport && (
              <Button
                variant="outlined"
                size="small"
                onClick={onBulkImport}
                sx={{
                  borderRadius: '9999px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  px: 2,
                  py: 0.75,
                  borderColor: '#D8B4FE',
                  color: '#0B1F3A',
                  '&:hover': { bgcolor: '#FAF5FF', borderColor: '#C084FC' },
                }}
              >
                Bulk Import
              </Button>
            )}
            <Button
              variant="contained"
              size="small"
              startIcon={<AddRoundedIcon />}
              onClick={onOpenAddModule}
              sx={{
                bgcolor: '#0B1F3A',
                borderRadius: '9999px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.84rem',
                px: 2.5,
                py: 0.75,
                '&:hover': { bgcolor: '#17366E' },
              }}
            >
              Add Module
            </Button>
          </Box>
        )}
      </Box>

      {/* Progress Ribbon for Students */}
      {isStudent && allSubmoduleItems.length > 0 && (
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: '16px',
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  bgcolor: courseCompletionPct === 100 ? '#ECFDF5' : '#FAF5FF',
                  color: courseCompletionPct === 100 ? '#10B981' : '#0B1F3A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${courseCompletionPct === 100 ? '#A7F3D0' : '#D8B4FE'}`,
                }}
              >
                {courseCompletionPct === 100 ? (
                  <EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />
                ) : (
                  <BoltRoundedIcon sx={{ fontSize: 20 }} />
                )}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.96rem' }}>
                  Course Completion Progress: {courseCompletionPct}%
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
                  {completedCount} of {allSubmoduleItems.length} submodules completed • Sequential Gated Progression
                </Typography>
              </Box>
            </Box>

            <Chip
              label={courseCompletionPct === 100 ? 'Course Completed 🎉' : `${allSubmoduleItems.length - completedCount} Submodules Remaining`}
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: '0.75rem',
                bgcolor: courseCompletionPct === 100 ? '#ECFDF5' : '#FAF5FF',
                color: courseCompletionPct === 100 ? '#059669' : '#0B1F3A',
                border: `1px solid ${courseCompletionPct === 100 ? '#A7F3D0' : '#D8B4FE'}`,
              }}
            />
          </Box>

          <Box sx={{ width: '100%', bgcolor: '#E2E8F0', borderRadius: '9999px', height: 8, overflow: 'hidden' }}>
            <Box
              sx={{
                width: `${courseCompletionPct}%`,
                height: '100%',
                borderRadius: '9999px',
                bgcolor: courseCompletionPct === 100 ? '#10B981' : '#0B1F3A',
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </Box>
        </Card>
      )}

      {/* Module List Accordion Stream */}
      {displayModules.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            py: 7,
            px: 3,
            bgcolor: '#F8FAFC',
            borderRadius: '20px',
            border: '1.5px dashed #CBD5E1',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              bgcolor: '#FAF5FF',
              color: '#0B1F3A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #F3E8FF',
            }}
          >
            <LayersRoundedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box sx={{ maxWidth: 460 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem', mb: 0.5 }}>
              No Curriculum Modules Added Yet
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '0.86rem', lineHeight: 1.6 }}>
              This course currently has 0 modules. Click below to author your first unit chapter, notes, quizzes, or coding challenges.
            </Typography>
          </Box>
          {!isStudent && (
            <Button
              variant="contained"
              onClick={onOpenAddModule}
              startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #0B1F3A 0%, #5B2D90 100%)',
                color: '#FFFFFF',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.86rem',
                px: 3,
                py: 0.8,
              }}
            >
              Create First Module
            </Button>
          )}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {displayModules.map((modItem: any, idx: number) => {
            const topicItems = moduleTopicMap[idx] || getModuleTopicItems(course, idx);
            const modTitle = modItem.title || `Module ${idx + 1}`;
            const modLessonCount = Array.isArray(modItem.lessons)
              ? modItem.lessons.length
              : typeof modItem.lessons === 'number'
              ? modItem.lessons
              : topicItems.length;
            const problemsCount = getModuleProblemsCount(modItem, idx, topicItems);
            const isExpanded = !!expandedModules[idx];
            const firstLessonKey = topicItems[0]?.id || `${idx}-0`;
            const totalUnits = displayModules.length;
            const isLast = idx === totalUnits - 1;
            const modUnlocked = isModuleUnlocked(idx);
            const modCompleted = topicItems.length > 0 && topicItems.every((t) => t.isCompleted);

            return (
              <Box
                key={modItem.id || idx}
                sx={{
                  borderBottom: isLast ? 'none' : '1px solid #E2E8F0',
                  transition: 'all 0.2s ease',
                  py: { xs: 1.5, md: 2 },
                  opacity: modUnlocked ? 1 : 0.72,
                }}
              >
                {/* Module Header Bar */}
                <Box
                  onClick={() => onToggleModule(idx)}
                  sx={{
                    py: { xs: 1.5, md: 2 },
                    px: { xs: 1, md: 2 },
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                    bgcolor: isExpanded ? '#F8FAFC' : 'transparent',
                    transition: 'background-color 0.2s ease',
                    '&:hover': { bgcolor: '#F8FAFC' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.25, flex: 1, minWidth: 240 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        bgcolor: modCompleted
                          ? '#ECFDF5'
                          : !modUnlocked
                          ? '#F1F5F9'
                          : isExpanded
                          ? '#0B1F3A'
                          : '#FAF5FF',
                        border: modCompleted
                          ? '1px solid #A7F3D0'
                          : !modUnlocked
                          ? '1px solid #E2E8F0'
                          : isExpanded
                          ? '1px solid #0B1F3A'
                          : '1px solid #F3E8FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '1.05rem',
                        color: modCompleted
                          ? '#059669'
                          : !modUnlocked
                          ? '#94A3B8'
                          : isExpanded
                          ? '#FFFFFF'
                          : '#0B1F3A',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {modCompleted ? (
                        <CheckRoundedIcon sx={{ fontSize: 22 }} />
                      ) : !modUnlocked ? (
                        <LockRoundedIcon sx={{ fontSize: 18 }} />
                      ) : (
                        String(idx + 1).padStart(2, '0')
                      )}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: '1.05rem', md: '1.18rem' },
                            color: modUnlocked ? '#0F172A' : '#64748B',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {modTitle}
                        </Typography>
                        {!modUnlocked && (
                          <Chip
                            icon={<LockRoundedIcon sx={{ fontSize: '13px !important', color: 'inherit !important' }} />}
                            label="Locked Unit"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              bgcolor: '#F1F5F9',
                              color: '#64748B',
                              border: '1px solid #E2E8F0',
                            }}
                          />
                        )}
                        {modCompleted && (
                          <Chip
                            icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important', color: 'inherit !important' }} />}
                            label="Unit Completed"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              bgcolor: '#ECFDF5',
                              color: '#059669',
                              border: '1px solid #A7F3D0',
                            }}
                          />
                        )}
                      </Box>
                      <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.84rem', mt: 0.35 }}>
                        Interactive Unit • {modLessonCount} Lessons • {problemsCount} Practice Problems
                      </Typography>
                    </Box>
                  </Box>

                  {/* Module Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                    {!isStudent && isStudioMode && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAddLesson(modItem, idx);
                          }}
                          startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            color: '#0B1F3A',
                            borderColor: '#D8B4FE',
                            bgcolor: '#FAF5FF',
                            px: 1.5,
                            py: 0.4,
                            '&:hover': { bgcolor: '#E9D5FF', borderColor: '#C084FC' },
                          }}
                        >
                          Add Submodule
                        </Button>

                        <Tooltip title="Edit Module">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditModule(modItem, idx);
                            }}
                            sx={{ color: '#64748B', bgcolor: '#F1F5F9', '&:hover': { color: '#0F172A', bgcolor: '#E2E8F0' } }}
                          >
                            <EditRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Move Module Up">
                          <span>
                            <IconButton
                              size="small"
                              disabled={idx === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                onReorderModule(idx, 'up');
                              }}
                              sx={{ color: '#64748B', bgcolor: '#F1F5F9', '&:hover': { color: '#0F172A', bgcolor: '#E2E8F0' } }}
                            >
                              <FluidArrowUpward sx={{ fontSize: 16 }} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Move Module Down">
                          <span>
                            <IconButton
                              size="small"
                              disabled={idx === totalUnits - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                onReorderModule(idx, 'down');
                              }}
                              sx={{ color: '#64748B', bgcolor: '#F1F5F9', '&:hover': { color: '#0F172A', bgcolor: '#E2E8F0' } }}
                            >
                              <FluidArrowDownward sx={{ fontSize: 16 }} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Delete Module">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteModule(idx, modItem.id);
                            }}
                            sx={{ color: '#94A3B8', bgcolor: '#F1F5F9', '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' } }}
                          >
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}

                    <Tooltip title={modUnlocked ? 'Start Module' : 'Complete previous units to unlock this module'}>
                      <span>
                        <Button
                          variant="contained"
                          disabled={isEnrolling || !modUnlocked}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!modUnlocked) {
                              toast.warning('Please complete all previous modules before starting this unit.', 'Module Locked');
                              return;
                            }
                            onEnrollOrStart(firstLessonKey);
                          }}
                          startIcon={modUnlocked ? <PlayArrowRoundedIcon sx={{ fontSize: 18 }} /> : <LockRoundedIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            borderRadius: '9999px',
                            bgcolor: modUnlocked ? '#0B1F3A' : '#F1F5F9',
                            color: modUnlocked ? '#FFFFFF' : '#94A3B8',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            px: 2.5,
                            py: 0.7,
                            boxShadow: 'none',
                            '&:hover': {
                              bgcolor: modUnlocked ? '#17366E' : '#F1F5F9',
                            },
                          }}
                        >
                          {modUnlocked ? 'Start Module' : 'Locked'}
                        </Button>
                      </span>
                    </Tooltip>

                    <IconButton
                      size="small"
                      sx={{ color: '#64748B', bgcolor: '#F1F5F9' }}
                    >
                      {isExpanded ? <KeyboardArrowUpRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
                    </IconButton>
                  </Box>
                </Box>

                {/* Expanded Submodules Stream */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box sx={{ pt: 1.5, pb: 1, pl: { xs: 1, md: 7.5 }, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    {topicItems.map((topic, tIdx) => {
                      const badge = getBadgeForType(topic.type);
                      const isCompleted = topic.isCompleted;

                      return (
                        <Card
                          key={topic.id || tIdx}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: '14px',
                            bgcolor: isCompleted ? '#F0FDF4' : '#FFFFFF',
                            border: `1px solid ${isCompleted ? '#BBF7D0' : '#E2E8F0'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 2,
                            transition: 'all 0.15s ease',
                            '&:hover': { borderColor: '#CBD5E1', bgcolor: isCompleted ? '#DCFCE7' : '#F8FAFC' },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 200 }}>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '8px',
                                bgcolor: isCompleted ? '#16A34A' : badge.bg,
                                color: isCompleted ? '#FFFFFF' : badge.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {isCompleted ? <CheckRoundedIcon sx={{ fontSize: 16 }} /> : badge.icon}
                            </Box>
                            <Box>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                                {topic.title}
                              </Typography>
                              <Typography sx={{ color: '#64748B', fontSize: '0.76rem', fontWeight: 500 }}>
                                {badge.label} • {topic.duration}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {!isStudent && isStudioMode && (
                              <>
                                <Tooltip title="Edit Submodule">
                                  <IconButton
                                    size="small"
                                    onClick={() => onOpenEditLesson(topic, modItem, idx)}
                                    sx={{ color: '#64748B', '&:hover': { color: '#0B1F3A' } }}
                                  >
                                    <EditRoundedIcon sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </Tooltip>
                                {topic.id && (
                                  <Tooltip title="Delete Submodule">
                                    <IconButton
                                      size="small"
                                      onClick={() => onDeleteLesson(topic.id!, idx)}
                                      sx={{ color: '#64748B', '&:hover': { color: '#EF4444' } }}
                                    >
                                      <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </>
                            )}
                            <Button
                              size="small"
                              disabled={isEnrolling || !modUnlocked}
                              onClick={() => onEnrollOrStart(topic.id || `${idx}-${tIdx}`)}
                              endIcon={<FluidArrowRight size={14} />}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                color: '#0B1F3A',
                                bgcolor: '#FAF5FF',
                                borderRadius: '8px',
                                px: 1.5,
                                py: 0.4,
                                '&:hover': { bgcolor: '#E9D5FF' },
                                '&.Mui-disabled': {
                                  bgcolor: '#F1F5F9',
                                  color: '#94A3B8',
                                },
                              }}
                            >
                              {isCompleted ? 'Review' : 'Launch'}
                            </Button>
                          </Box>
                        </Card>
                      );
                    })}
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </Box>
      )}
    </Card>
  );
}

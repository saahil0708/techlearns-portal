'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Divider,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';

// Icons
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';

import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import CodeEditorWorkspace from '@/components/editor/CodeEditorWorkspace';
import { CourseDirectoryEntity } from '@/types/course';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';
import { formatArticleMarkdown } from '@/utils/markdown';

interface CourseLearningWorkspaceProps {
  course: CourseDirectoryEntity;
}

interface LessonItem {
  id: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  durationMinutes: number;
  type: 'reading' | 'code' | 'quiz';
  contentMarkdown: string;
  starterCode?: string;
  language?: 'python' | 'cpp' | 'java' | 'javascript';
}

// Generate rich dynamic lessons for course tracks
function generateCourseLessons(course: CourseDirectoryEntity): LessonItem[] {
  const lessons: LessonItem[] = [];
  const highlights = course.moduleHighlights && course.moduleHighlights.length > 0
    ? course.moduleHighlights
    : [
        { title: 'Core Foundations & Principles', lessons: 4 },
        { title: 'Data Structures & Algorithmic Patterns', lessons: 4 },
        { title: 'Advanced Problem Solving & Optimization', lessons: 4 },
      ];

  const isDesignTrack =
    course.code?.startsWith('DES') ||
    course.category?.toLowerCase().includes('design') ||
    course.category?.toLowerCase().includes('ui/ux');

  highlights.forEach((m, mIdx) => {
    const count = m.lessons || 3;
    for (let lIdx = 1; lIdx <= count; lIdx++) {
      const lessonId = `les-${mIdx + 1}-${lIdx}`;
      const isCode = !isDesignTrack && lIdx % 2 === 0;

      let markdownContent = '';
      if (isDesignTrack) {
        markdownContent = `## Overview\n\nIn this lesson, we explore the core design principles of **${m.title}** in **${course.title}** and understand how user-centered design systems, visual hierarchy, and wireframes are structured for modern digital products.\n\n### Key Concepts Covered\n- Visual hierarchy, typography scales, and WCAG accessibility standards\n- Component libraries, atomic design tokens, and spacing grids (4pt/8pt)\n- User journey mapping, wireframing workflows, and interactive prototyping\n\n### Design Application\nAnalyze user personas and evaluate design patterns for **${course.title}**:\n\n> **Design Tip**: Always ensure color contrast ratios meet AA standard (4.5:1 for normal text) when building cohesive themes.`;
      } else {
        markdownContent = `## Overview\n\nIn this lesson, we explore the foundational concepts of **${m.title}** in **${course.title}** and understand how optimal algorithms and data structures are formulated.\n\n### Key Concepts Covered\n- Asymptotic complexity and invariant guarantees\n- Recursive transition state equations\n- Memory caching and cache locality benchmarks\n\n### Practical Implementation\nReview the following implementation pattern:\n\n\`\`\`cpp\n// Optimal ${course.category} solution\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    cout << "Executing ${m.title} benchmark..." << endl;\n    return 0;\n}\n\`\`\`\n\n> **Note**: Test your solution against the sample constraints in the editor below.`;
      }

      lessons.push({
        id: lessonId,
        moduleId: `mod-${mIdx + 1}`,
        moduleTitle: m.title,
        title: `${m.title}: Part ${lIdx} — ${isDesignTrack ? 'Design System & Prototyping' : 'Core Concepts & Implementation'}`,
        durationMinutes: 15 + lIdx * 5,
        type: isCode ? 'code' : 'reading',
        contentMarkdown: markdownContent,
        starterCode: isCode
          ? `# Complete your ${course.title} exercise\ndef solve_problem():\n    # Write your logic here\n    print("Success: Test cases validated")\n\nsolve_problem()`
          : undefined,
        language: 'python',
      });
    }
  });

  return lessons;
}

export default function CourseLearningWorkspace({ course }: CourseLearningWorkspaceProps) {
  const router = useRouter();
  const toast = useToast();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const lessons = generateCourseLessons(course);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(
    new Set<string>()
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'content' | 'practice'>('content');

  const currentLesson = lessons[activeLessonIdx] || lessons[0];

  const progressPercent = Math.round(
    (completedLessonIds.size / Math.max(1, lessons.length)) * 100
  );

  const toggleLessonComplete = async (lessonId: string) => {
    const isCompleted = completedLessonIds.has(lessonId);
    const previous = new Set(completedLessonIds);
    const updated = new Set(completedLessonIds);

    if (isCompleted) {
      updated.delete(lessonId);
    } else {
      updated.add(lessonId);
    }
    setCompletedLessonIds(updated);

    try {
      await apiService.updateLessonProgress(lessonId, !isCompleted);
      if (!isCompleted) {
        toast.success(`Lesson marked as completed!`, 'Progress Saved');
      }
    } catch (err: any) {
      // Restore previous state on failure and show error notification
      setCompletedLessonIds(previous);
      toast.error(err?.message || 'Failed to update lesson progress', 'Progress Error');
    }
  };

  const handleNextLesson = () => {
    if (activeLessonIdx < lessons.length - 1) {
      setActiveLessonIdx(activeLessonIdx + 1);
    }
  };

  const handlePrevLesson = () => {
    if (activeLessonIdx > 0) {
      setActiveLessonIdx(activeLessonIdx - 1);
    }
  };

  const sidebarContent = (
    <Box sx={{ width: { xs: 280, md: 320 }, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF', borderRight: '1px solid #E2E8F0' }}>
      {/* Course Info Header */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9' }}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => router.push('/courses')}
          sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.8rem', textTransform: 'none', px: 0, mb: 1.5, '&:hover': { bgcolor: 'transparent', color: '#0F172A' } }}
        >
          Back to Catalog
        </Button>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.3, mb: 1 }}>
          {course.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Chip label={course.level} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' }} />
          <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
            {course.durationHours} hrs total
          </Typography>
        </Box>

        {/* Course Progress */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
              Curriculum Progress
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563EB' }}>
              {progressPercent}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 6,
              borderRadius: '9999px',
              bgcolor: '#EEF2F6',
              '& .MuiLinearProgress-bar': { bgcolor: '#2563EB', borderRadius: '9999px' },
            }}
          />
        </Box>
      </Box>

      {/* Syllabus Module & Lesson Outline */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
        <Typography sx={{ px: 1, py: 1, fontSize: '0.74rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Table of Contents
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {lessons.map((lesson, idx) => {
            const isActive = idx === activeLessonIdx;
            const isCompleted = completedLessonIds.has(lesson.id);

            return (
              <Box
                key={lesson.id}
                onClick={() => {
                  setActiveLessonIdx(idx);
                  if (isMobile) setSidebarOpen(false);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  p: 1.2,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  bgcolor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(37, 99, 235, 0.2)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(37, 99, 235, 0.12)' : '#F8FAFC',
                  },
                }}
              >
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLessonComplete(lesson.id);
                  }}
                  sx={{ p: 0.2 }}
                >
                  {isCompleted ? (
                    <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                  ) : (
                    <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 18, color: '#CBD5E1' }} />
                  )}
                </IconButton>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    noWrap
                    sx={{
                      fontSize: '0.82rem',
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? '#2563EB' : isCompleted ? '#475569' : '#0F172A',
                    }}
                  >
                    {lesson.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    {lesson.durationMinutes} mins • {lesson.type === 'code' ? 'Interactive Coding' : 'Reading'}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );

  return (
    <StudentAppLayout streakDays={48} contestRating={2380} ratingTier="Master">
      <Box sx={{ display: 'flex', minHeight: '80vh', bgcolor: '#F8FAFC', borderRadius: '18px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
        {/* Desktop Left Sidebar */}
        {!isMobile && sidebarContent}

        {/* Mobile Sidebar Drawer */}
        {isMobile && (
          <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
            {sidebarContent}
          </Drawer>
        )}

        {/* Main Lesson Viewer Workspace */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Top Control Bar */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: '#FFFFFF',
              borderBottom: '1px solid #E2E8F0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {isMobile && (
                <IconButton onClick={() => setSidebarOpen(true)} size="small">
                  <MenuRoundedIcon />
                </IconButton>
              )}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  {currentLesson.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Module: {currentLesson.moduleTitle}
                </Typography>
              </Box>
            </Box>

            {/* Mode Switcher */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant={activeWorkspaceTab === 'content' ? 'contained' : 'outlined'}
                startIcon={<MenuBookRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => setActiveWorkspaceTab('content')}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                }}
              >
                Lesson
              </Button>
              <Button
                size="small"
                variant={activeWorkspaceTab === 'practice' ? 'contained' : 'outlined'}
                startIcon={<CodeRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => setActiveWorkspaceTab('practice')}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                }}
              >
                Practice Sandbox
              </Button>
            </Box>
          </Box>

          {/* Lesson Body Content */}
          <Box sx={{ flex: 1, p: { xs: 2.5, md: 4 }, overflowY: 'auto' }}>
            {activeWorkspaceTab === 'content' ? (
              <Card
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  border: '1px solid #F1F5F9',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      icon={<WorkspacePremiumRoundedIcon sx={{ fontSize: 14, color: '#2563EB !important' }} />}
                      label={course.category}
                      size="small"
                      sx={{ bgcolor: 'rgba(37, 99, 235, 0.08)', color: '#2563EB', fontWeight: 700, fontSize: '0.74rem' }}
                    />
                    <Chip
                      label={`${currentLesson.durationMinutes} min read`}
                      size="small"
                      sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 600, fontSize: '0.74rem' }}
                    />
                  </Box>

                  <Button
                    variant={completedLessonIds.has(currentLesson.id) ? 'outlined' : 'contained'}
                    color={completedLessonIds.has(currentLesson.id) ? 'success' : 'primary'}
                    startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}
                    onClick={() => toggleLessonComplete(currentLesson.id)}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '0.8rem' }}
                  >
                    {completedLessonIds.has(currentLesson.id) ? 'Completed' : 'Mark as Done'}
                  </Button>
                </Box>

                {/* Formatted Markdown Content */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, color: '#334155', lineHeight: 1.8, fontSize: '0.94rem' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                    {currentLesson.title}
                  </Typography>

                  <Box
                    dangerouslySetInnerHTML={{ __html: formatArticleMarkdown(currentLesson.contentMarkdown) }}
                    sx={{
                      '& h2': { fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', mt: 2, mb: 1 },
                      '& h3': { fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', mt: 1.5, mb: 0.5 },
                      '& p': { color: '#334155', mb: 1.5, lineHeight: 1.7 },
                      '& ul, & ol': { pl: 3, mb: 1.5 },
                      '& li': { mb: 0.5, color: '#334155' },
                      '& blockquote': { bgcolor: '#F8FAFC', p: 2, borderRadius: '8px', borderLeft: '4px solid #2563EB', my: 2, fontStyle: 'normal' },
                      '& pre': { bgcolor: '#0F172A', color: '#F8FAFC', p: 2, borderRadius: '8px', overflowX: 'auto', my: 2 },
                      '& code': { fontFamily: 'monospace' },
                    }}
                  />

                  {/* Inline Code Sandbox Quick View (only when lesson has code / starter code) */}
                  {currentLesson.type === 'code' && (
                    <Box sx={{ mt: 2 }}>
                      <Typography sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                        Live Interactive Code Playground
                      </Typography>
                      <CodeEditorWorkspace initialLanguage={currentLesson.language || 'python'} initialCode={currentLesson.starterCode} />
                    </Box>
                  )}
                </Box>
              </Card>
            ) : (
              /* Full Practice Sandbox Tab */
              <Box sx={{ height: '100%', minHeight: 600 }}>
                <CodeEditorWorkspace initialLanguage="python" />
              </Box>
            )}
          </Box>

          {/* Footer Navigation Bar */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
            }}
          >
            <Button
              variant="outlined"
              startIcon={<NavigateBeforeRoundedIcon />}
              onClick={handlePrevLesson}
              disabled={activeLessonIdx === 0}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '0.82rem' }}
            >
              Previous Lesson
            </Button>

            <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
              Lesson {activeLessonIdx + 1} of {lessons.length}
            </Typography>

            <Button
              variant="contained"
              endIcon={<NavigateNextRoundedIcon />}
              onClick={handleNextLesson}
              disabled={activeLessonIdx === lessons.length - 1}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', bgcolor: '#2563EB' }}
            >
              Next Lesson
            </Button>
          </Box>
        </Box>
      </Box>
    </StudentAppLayout>
  );
}

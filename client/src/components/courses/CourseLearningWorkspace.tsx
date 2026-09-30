'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  Button,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  Tooltip,
} from '@mui/material';

// Icons
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';

import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import CodeEditorWorkspace from '@/components/editor/CodeEditorWorkspace';
import { CourseDirectoryEntity } from '@/types/course';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';
import { formatArticleMarkdown } from '@/utils/markdown';

interface CourseLearningWorkspaceProps {
  course: CourseDirectoryEntity;
}

interface CodingExercise {
  title: string;
  description: string;
  starterCode: string;
  language: 'python' | 'cpp' | 'java' | 'javascript';
  sampleInput?: string;
  sampleOutput?: string;
}

interface QuizMCQ {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface LessonItem {
  id: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  durationMinutes: number;
  type: 'reading' | 'code' | 'quiz';
  contentMarkdown: string;
  codingProblem?: CodingExercise;
  quizMCQ?: QuizMCQ;
}

// Generate dynamic structured lessons for the course
function generateCourseLessons(course: CourseDirectoryEntity): LessonItem[] {
  const lessons: LessonItem[] = [];

  const isDesignTrack =
    course.code?.startsWith('DES') ||
    course.category?.toLowerCase().includes('design') ||
    course.category?.toLowerCase().includes('ui/ux');

  if (Array.isArray(course.modules) && course.modules.length > 0) {
    course.modules.forEach((m, mIdx) => {
      const lessonItems = m.lessons || [];
      lessonItems.forEach((les, lIdx) => {
        const isCode = !isDesignTrack && lIdx % 2 === 1;
        const starterCode = isCode
          ? `# Complete the exercise for ${les.title}\ndef solve_problem(input_data):\n    # Write your algorithmic solution here\n    return input_data\n\n# Test execution\nprint(solve_problem("Test Passed"))`
          : undefined;

        const content = les.content
          ? `## ${les.title}\n\n${les.content}\n\n### Core Insights\nIn this lesson of **${course.title}**, you will master the concepts of **${m.title}** through hands-on exercises.\n\n### Key Concepts\n- Robust state handling and memory footprint management.\n- Algorithmic throughput scaling and benchmark optimization.\n- Comprehensive test case coverage across standard and boundary inputs.`
          : `## ${les.title}\n\nDetailed walkthrough for **${les.title}** within **${m.title}**.\n\n### Key Takeaways\n- Core foundations and engineering standards in ${course.category || course.title}.\n- Best practices, architectural patterns, and performance considerations.\n- Hands-on exercises and real-world implementation techniques.`;

        const quizData = (les as any).quizMCQ || (les as any).quiz;

        lessons.push({
          id: les.id || `${mIdx}-${lIdx}`,
          moduleId: m.id || `mod-${mIdx + 1}`,
          moduleTitle: m.title,
          title: les.title || `Lesson ${lIdx + 1}`,
          durationMinutes: 20 + lIdx * 5,
          type: isCode ? 'code' : 'reading',
          contentMarkdown: content,
          codingProblem: isCode
            ? {
                title: `${les.title} Implementation Challenge`,
                description: `Implement an optimal solution for ${les.title}.`,
                starterCode: starterCode!,
                language: isDesignTrack ? 'javascript' : 'python',
                sampleInput: 'Input: [4, 7, 2, 9, 1]',
                sampleOutput: 'Output: [1, 2, 4, 7, 9]',
              }
            : undefined,
          quizMCQ: quizData
            ? {
                question: quizData.question,
                options: quizData.options,
                correctIndex: quizData.correctIndex ?? 0,
                explanation: quizData.explanation || 'Review the lesson notes for details.',
              }
            : undefined,
        });
      });
    });

    if (lessons.length > 0) {
      return lessons;
    }
  }

  const highlights =
    course.moduleHighlights && course.moduleHighlights.length > 0
      ? course.moduleHighlights
      : [
          { title: 'Core Foundations & Principles', lessons: 4 },
          { title: 'Data Structures & Algorithmic Patterns', lessons: 4 },
          { title: 'Advanced Problem Solving & Optimization', lessons: 4 },
        ];

  highlights.forEach((m, mIdx) => {
    const count = m.lessons || 3;
    for (let lIdx = 1; lIdx <= count; lIdx++) {
      const lessonId = `${mIdx}-${lIdx - 1}`;
      const isCode = !isDesignTrack && lIdx % 2 === 0;

      const markdownContent = `## ${m.title} — Part ${lIdx}\n\nIn this lesson, we explore the core principles of **${m.title}** and understand how optimal patterns, clean architectures, and solutions are formulated.\n\n### Key Concepts Covered\n- Core concepts and fundamentals for ${course.category || course.title}.\n- Practical techniques, design patterns, and engineering workflows.\n- Edge case evaluation and performance validation.`;

      lessons.push({
        id: lessonId,
        moduleId: `mod-${mIdx + 1}`,
        moduleTitle: m.title,
        title: `${m.title}: Part ${lIdx}`,
        durationMinutes: 15 + lIdx * 5,
        type: isCode ? 'code' : 'reading',
        contentMarkdown: markdownContent,
        codingProblem: isCode
          ? {
              title: `${m.title} Challenge`,
              description: `Implement a solution for ${m.title}. Optimize for optimal execution time and minimal space complexity.`,
              starterCode: `# Solve the challenge for ${m.title}\ndef solve(data):\n    return data\n\nprint(solve("Test Input"))`,
              language: isDesignTrack ? 'javascript' : 'python',
              sampleInput: 'Input: [5, 2, 8, 1, 9]',
              sampleOutput: 'Output: [1, 2, 5, 8, 9]',
            }
          : undefined,
      });
    }
  });

  return lessons;
}

// Pixel-perfect vector 6-dot grip handle matching reference design with clear dot separation
function ResizerGripHandle() {
  return (
    <svg
      width="8"
      height="18"
      viewBox="0 0 8 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', pointerEvents: 'none' }}
    >
      <circle cx="1.75" cy="2.5" r="1.25" fill="currentColor" />
      <circle cx="6.25" cy="2.5" r="1.25" fill="currentColor" />
      <circle cx="1.75" cy="9" r="1.25" fill="currentColor" />
      <circle cx="6.25" cy="9" r="1.25" fill="currentColor" />
      <circle cx="1.75" cy="15.5" r="1.25" fill="currentColor" />
      <circle cx="6.25" cy="15.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

export default function CourseLearningWorkspace({ course }: CourseLearningWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const lessons = useMemo(() => generateCourseLessons(course), [course]);

  const [activeLessonIdx, setActiveLessonIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'note' | 'problem'>('note');
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  // MCQ state
  const [selectedMCQOption, setSelectedMCQOption] = useState<number | null>(null);
  const [isMCQSubmitted, setIsMCQSubmitted] = useState<boolean>(false);

  // Resizable split-pane width state
  const [leftSplitPercent, setLeftSplitPercent] = useState<number>(34);
  const isDraggingSplitRef = useRef<boolean>(false);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const pendingSaveRef = useRef<Set<string>>(new Set());

  const currentLesson = lessons[activeLessonIdx] || lessons[0];
  const hasExercises = Boolean(currentLesson.quizMCQ || currentLesson.codingProblem);
  const effectiveTab: 'note' | 'problem' = hasExercises ? activeTab : 'note';

  // Sync with URL query parameter
  const lessonParam = searchParams.get('lesson');
  useEffect(() => {
    if (lessonParam && lessons.length > 0) {
      const targetIdx = lessons.findIndex((l) => l.id === lessonParam);
      if (targetIdx !== -1) {
        setActiveLessonIdx(targetIdx);
        const targetLesson = lessons[targetIdx];
        if (!targetLesson?.quizMCQ && !targetLesson?.codingProblem) {
          setActiveTab('note');
        }
      }
    }
  }, [lessonParam, lessons]);

  // Reset MCQ submission state on lesson change
  useEffect(() => {
    setSelectedMCQOption(null);
    setIsMCQSubmitted(false);
  }, [activeLessonIdx, activeTab]);

  // Handle pointer drag resizing
  const handlePointerDownResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingSplitRef.current = true;
  };

  const handlePointerMoveResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSplitRef.current || !splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const newPercent = Math.max(22, Math.min(50, (relativeX / rect.width) * 100));
    setLeftSplitPercent(newPercent);
  };

  const handlePointerUpResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingSplitRef.current) {
      isDraggingSplitRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const toggleLessonComplete = async (lessonId: string): Promise<boolean> => {
    if (pendingSaveRef.current.has(lessonId)) {
      return false;
    }
    pendingSaveRef.current.add(lessonId);

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
        toast.success('Lesson marked as completed!', 'Progress Saved');
      }
      return true;
    } catch (err: any) {
      setCompletedLessonIds(previous);
      toast.error(err?.message || 'Failed to update lesson progress', 'Progress Error');
      return false;
    } finally {
      pendingSaveRef.current.delete(lessonId);
    }
  };

  const handleNextStep = async () => {
    if (effectiveTab === 'note') {
      if (hasExercises) {
        setActiveTab('problem');
      } else {
        // Pure reading lesson with no exercises: mark complete and advance on success
        if (!completedLessonIds.has(currentLesson.id)) {
          const success = await toggleLessonComplete(currentLesson.id);
          if (!success) return;
        }
        if (activeLessonIdx < lessons.length - 1) {
          const nextIdx = activeLessonIdx + 1;
          setActiveLessonIdx(nextIdx);
          setActiveTab('note');
          const nextLesson = lessons[nextIdx];
          if (nextLesson?.id) {
            router.replace(`/courses/${course.slug || course.id}/learn?lesson=${encodeURIComponent(nextLesson.id)}`, { scroll: false });
          }
        } else {
          toast.info('You have completed all lessons in this track!', 'Track Completed');
        }
      }
    } else if (effectiveTab === 'problem') {
      if (activeLessonIdx < lessons.length - 1) {
        const nextIdx = activeLessonIdx + 1;
        setActiveLessonIdx(nextIdx);
        setActiveTab('note');
        const nextLesson = lessons[nextIdx];
        if (nextLesson?.id) {
          router.replace(`/courses/${course.slug || course.id}/learn?lesson=${encodeURIComponent(nextLesson.id)}`, { scroll: false });
        }
      } else {
        toast.info('You have completed all lessons in this track!', 'Track Completed');
      }
    }
  };

  const handlePrevStep = () => {
    if (effectiveTab === 'problem') {
      setActiveTab('note');
    } else if (effectiveTab === 'note' && activeLessonIdx > 0) {
      const prevIdx = activeLessonIdx - 1;
      setActiveLessonIdx(prevIdx);
      const prevLesson = lessons[prevIdx];
      const prevHasExercises = Boolean(prevLesson?.quizMCQ || prevLesson?.codingProblem);
      setActiveTab(prevHasExercises ? 'problem' : 'note');
      if (prevLesson?.id) {
        router.replace(`/courses/${course.slug || course.id}/learn?lesson=${encodeURIComponent(prevLesson.id)}`, { scroll: false });
      }
    }
  };

  const isMCQCorrect =
    currentLesson?.quizMCQ &&
    selectedMCQOption === currentLesson.quizMCQ.correctIndex;

  return (
    <StudentAppLayout streakDays={48} contestRating={2380} ratingTier="Master">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '88vh',
          bgcolor: '#F8FAFC',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}
      >
        {/* Top Navigation Bar */}
        <Box
          sx={{
            height: 50,
            px: { xs: 2, md: 3 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          {/* Top Left: Mode Tab Pill (Note or Problem) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="button"
              onClick={() => {
                if (hasExercises) {
                  setActiveTab(activeTab === 'note' ? 'problem' : 'note');
                }
              }}
              sx={{
                all: 'unset',
                cursor: hasExercises ? 'pointer' : 'default',
                px: 2,
                py: 0.55,
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.7,
                bgcolor: '#0F172A',
                color: '#FFFFFF',
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: hasExercises ? '#1E293B' : '#0F172A' },
              }}
            >
              {effectiveTab === 'note' ? (
                <>
                  <MenuBookRoundedIcon sx={{ fontSize: 16 }} />
                  Note
                </>
              ) : (
                <>
                  <QuizRoundedIcon sx={{ fontSize: 16 }} />
                  Problem
                </>
              )}
            </Box>
          </Box>

          {/* Top Right: Settings Icon */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Settings">
              <IconButton size="small" sx={{ color: '#64748B' }}>
                <SettingsOutlinedIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Split-Pane Main Body */}
        <Box
          ref={splitContainerRef}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            overflow: 'hidden',
            bgcolor: '#F8FAFC',
          }}
        >
          {/* 1. LEFT PANEL */}
          <Box
            sx={{
              width: { xs: '100%', md: `${leftSplitPercent}%` },
              minWidth: { md: 260 },
              p: { xs: 2.5, md: 3.5 },
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#FFFFFF',
              overflowY: 'auto',
            }}
          >
            {effectiveTab === 'note' ? (
              /* NOTE LEFT SIDEBAR */
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header: Note Icon + Title + Share */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MenuBookRoundedIcon sx={{ color: '#0F172A', fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '0.98rem', color: '#0F172A' }}>
                      {currentLesson.title}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (typeof window !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Lesson link copied!', 'Share');
                      }
                    }}
                    sx={{ color: '#64748B', p: 0.5 }}
                  >
                    <ShareRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                {/* Action Row: Download note & Send feedback */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #F1F5F9' }}>
                  <Button
                    size="small"
                    startIcon={<DownloadRoundedIcon sx={{ fontSize: 16 }} />}
                    onClick={() => toast.info('Note saved for offline reading.', 'Download')}
                    sx={{
                      textTransform: 'none',
                      color: '#64748B',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      p: 0,
                      '&:hover': { color: '#0F172A', bgcolor: 'transparent', textDecoration: 'underline' },
                    }}
                  >
                    Download note
                  </Button>

                  <Button
                    size="small"
                    startIcon={<FeedbackOutlinedIcon sx={{ fontSize: 15 }} />}
                    onClick={() => toast.info('Feedback dialog opened.', 'Feedback')}
                    sx={{
                      textTransform: 'none',
                      color: '#64748B',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      p: 0,
                      '&:hover': { color: '#0F172A', bgcolor: 'transparent', textDecoration: 'underline' },
                    }}
                  >
                    Send feedback
                  </Button>
                </Box>
              </Box>
            ) : (
              /* PROBLEM LEFT SIDEBAR */
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header: Grid Icon + Title + Share */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <QuizRoundedIcon sx={{ color: '#0F172A', fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '0.98rem', color: '#0F172A' }}>
                      {currentLesson.title.replace(': Part 1', '').replace('Introduction', 'Python syntax')}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (typeof window !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Problem link copied!', 'Share');
                      }
                    }}
                    sx={{ color: '#64748B', p: 0.5 }}
                  >
                    <ShareRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                {/* Difficulty & Points */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#16A34A' }}>
                    Easy
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8' }}>•</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <BoltRoundedIcon sx={{ fontSize: 15, color: '#F59E0B' }} />
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                      0/10
                    </Typography>
                  </Box>
                </Box>

                {/* Problem Statement Header & Feedback */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>
                    Problem statement
                  </Typography>
                  <Typography
                    onClick={() => toast.info('Feedback received.', 'Feedback')}
                    sx={{ fontSize: '0.78rem', color: '#64748B', cursor: 'pointer', '&:hover': { color: '#0F172A', textDecoration: 'underline' } }}
                  >
                    Send feedback
                  </Typography>
                </Box>

                {/* Problem Statement Body */}
                <Typography sx={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, mb: 3 }}>
                  {currentLesson.quizMCQ?.question || currentLesson.codingProblem?.description || 'What is the primary advantage of Python\'s syntax ?'}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Vertical Resizer Divider Bar with 6-Dot Grip Handle */}
          <Box
            role="separator"
            tabIndex={0}
            aria-valuenow={Math.round(leftSplitPercent)}
            aria-valuemin={22}
            aria-valuemax={50}
            aria-label="Resize panels"
            onPointerDown={handlePointerDownResize}
            onPointerMove={handlePointerMoveResize}
            onPointerUp={handlePointerUpResize}
            onPointerCancel={handlePointerUpResize}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setLeftSplitPercent((p) => Math.max(22, p - 2));
              } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setLeftSplitPercent((p) => Math.min(50, p + 2));
              }
            }}
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              width: 10,
              minWidth: 10,
              maxWidth: 10,
              bgcolor: '#F8FAFC',
              borderLeft: '1px solid #E2E8F0',
              borderRight: '1px solid #E2E8F0',
              cursor: 'col-resize',
              color: '#94A3B8',
              userSelect: 'none',
              touchAction: 'none',
              outline: 'none',
              transition: 'background-color 0.15s ease, color 0.15s ease',
              '&:hover, &:focus-visible': {
                bgcolor: '#E2E8F0',
                color: '#475569',
              },
            }}
          >
            <ResizerGripHandle />
          </Box>

          {/* 2. RIGHT PANEL */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 2, md: 2.5 },
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {effectiveTab === 'note' ? (
              /* NOTE RIGHT PANEL: CLEAN READING CONTENT CARD */
              <Card
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: '14px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                }}
              >
                <Box
                  dangerouslySetInnerHTML={{ __html: formatArticleMarkdown(currentLesson.contentMarkdown) }}
                  sx={{
                    color: '#334155',
                    lineHeight: 1.65,
                    fontSize: '0.94rem',
                    '& h2': { fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', mt: 0, mb: 1.5, letterSpacing: '-0.02em' },
                    '& h3': { fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', mt: 2, mb: 1 },
                    '& p': { color: '#334155', mb: 1.5, lineHeight: 1.65 },
                    '& ul, & ol': { pl: 2.5, mb: 1.5 },
                    '& li': { mb: 0.5, color: '#334155', lineHeight: 1.6 },
                    '& strong': { color: '#0F172A', fontWeight: 700 },
                    '& blockquote': { bgcolor: '#F8FAFC', p: 1.5, borderRadius: '8px', borderLeft: '4px solid #2563EB', my: 1.5, fontStyle: 'normal' },
                    '& pre': { bgcolor: '#0F172A', color: '#F8FAFC', p: 2, borderRadius: '10px', overflowX: 'auto', my: 2 },
                    '& code': { fontFamily: 'monospace' },
                  }}
                />

                {/* Bottom Action inside Note Card */}
                <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Button
                    variant={completedLessonIds.has(currentLesson.id) ? 'outlined' : 'contained'}
                    color={completedLessonIds.has(currentLesson.id) ? 'success' : 'inherit'}
                    onClick={() => toggleLessonComplete(currentLesson.id)}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      px: 2.5,
                      py: 0.7,
                      ...(completedLessonIds.has(currentLesson.id)
                        ? { borderColor: '#86EFAC', color: '#16A34A', bgcolor: '#F0FDF4' }
                        : { bgcolor: '#F1F5F9', color: '#334155', '&:hover': { bgcolor: '#E2E8F0' } }),
                    }}
                  >
                    {completedLessonIds.has(currentLesson.id) ? '✓ Completed' : 'Mark as Done'}
                  </Button>

                  {hasExercises ? (
                    <Button
                      variant="contained"
                      onClick={() => setActiveTab('problem')}
                      sx={{
                        bgcolor: '#F97316',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        px: 3,
                        py: 0.8,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#EA580C', boxShadow: 'none' },
                      }}
                    >
                      Next: Related Question & Practice →
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNextStep}
                      sx={{
                        bgcolor: '#F97316',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        px: 3,
                        py: 0.8,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#EA580C', boxShadow: 'none' },
                      }}
                    >
                      Complete & Next Lesson →
                    </Button>
                  )}
                </Box>
              </Card>
            ) : (
              /* PROBLEM RIGHT PANEL: OPTIONS RADIO CARDS */
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {currentLesson.quizMCQ && (
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem', mb: 2.5 }}>
                      Options: Pick one correct answer from below
                    </Typography>

                    <FormControl component="fieldset" sx={{ width: '100%' }}>
                      <RadioGroup
                        value={selectedMCQOption !== null ? selectedMCQOption : ''}
                        onChange={(e) => {
                          if (!isMCQSubmitted) {
                            setSelectedMCQOption(parseInt(e.target.value, 10));
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {currentLesson.quizMCQ.options.map((opt, optIdx) => {
                            const isSelected = selectedMCQOption === optIdx;
                            const isCorrectOpt = optIdx === currentLesson.quizMCQ!.correctIndex;

                            let optBorder = '#E2E8F0';
                            let optBg = '#FFFFFF';
                            if (isSelected) {
                              optBorder = '#F97316';
                              optBg = '#FFF7ED';
                            }
                            if (isMCQSubmitted) {
                              if (isCorrectOpt) {
                                optBorder = '#10B981';
                                optBg = '#ECFDF5';
                              } else if (isSelected && !isCorrectOpt) {
                                optBorder = '#EF4444';
                                optBg = '#FEF2F2';
                              }
                            }

                            return (
                              <Box
                                key={optIdx}
                                onClick={() => {
                                  if (!isMCQSubmitted) setSelectedMCQOption(optIdx);
                                }}
                                sx={{
                                  p: 2,
                                  px: 2.5,
                                  borderRadius: '10px',
                                  border: `1.5px solid ${optBorder}`,
                                  bgcolor: optBg,
                                  cursor: isMCQSubmitted ? 'default' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  transition: 'all 0.15s ease',
                                  '&:hover': {
                                    bgcolor: isMCQSubmitted ? optBg : '#F8FAFC',
                                    borderColor: isMCQSubmitted ? optBorder : '#CBD5E1',
                                  },
                                }}
                              >
                                <FormControlLabel
                                  value={optIdx}
                                  control={<Radio size="small" sx={{ color: isSelected ? '#F97316' : '#94A3B8', '&.Mui-checked': { color: '#F97316' } }} />}
                                  label={
                                    <Typography sx={{ fontSize: '0.88rem', fontWeight: isSelected ? 700 : 500, color: '#1E293B' }}>
                                      {opt}
                                    </Typography>
                                  }
                                  sx={{ m: 0, width: '100%' }}
                                />
                                {isMCQSubmitted && isCorrectOpt && (
                                  <CheckRoundedIcon sx={{ color: '#059669', fontSize: 20 }} />
                                )}
                                {isMCQSubmitted && isSelected && !isCorrectOpt && (
                                  <CloseRoundedIcon sx={{ color: '#DC2626', fontSize: 20 }} />
                                )}
                              </Box>
                            );
                          })}
                        </Box>
                      </RadioGroup>
                    </FormControl>

                    {/* Explanation Alert */}
                    {isMCQSubmitted && (
                      <Alert
                        severity={isMCQCorrect ? 'success' : 'error'}
                        sx={{ mt: 3, borderRadius: '10px', fontSize: '0.85rem' }}
                      >
                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 0.3 }}>
                          {isMCQCorrect ? 'Correct Solution!' : 'Incorrect Choice'}
                        </Typography>
                        {currentLesson.quizMCQ.explanation}
                      </Alert>
                    )}
                  </Box>
                )}

                {/* Coding Problem Sandbox Runner */}
                {currentLesson.codingProblem && (
                  <Box sx={{ mt: 2 }}>
                    <CodeEditorWorkspace
                      initialLanguage={currentLesson.codingProblem.language}
                      initialCode={currentLesson.codingProblem.starterCode}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Bottom Action Footer */}
        <Box
          sx={{
            height: 60,
            px: { xs: 2, md: 4 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            position: 'relative',
          }}
        >
          {/* Left Spacer for symmetrical centering */}
          <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />

          {/* Center Navigation Actions: Prev, Submit MCQ (if active), and Next */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3.5, justifyContent: 'center' }}>
            {/* Prev Action */}
            <Button
              variant="text"
              onClick={handlePrevStep}
              disabled={effectiveTab === 'note' && activeLessonIdx === 0}
              sx={{
                color: effectiveTab === 'note' && activeLessonIdx === 0 ? '#CBD5E1' : '#64748B',
                fontWeight: 700,
                fontSize: '0.86rem',
                textTransform: 'none',
                minWidth: 'auto',
                p: 0,
                '&:hover': { color: '#0F172A', bgcolor: 'transparent' },
                '&.Mui-disabled': { color: '#CBD5E1' },
              }}
            >
              Prev
            </Button>

            {/* Submit MCQ Button (in Problem mode when MCQ is unsubmitted) */}
            {effectiveTab === 'problem' && currentLesson.quizMCQ && !isMCQSubmitted && (
              <Button
                variant="contained"
                disabled={selectedMCQOption === null}
                onClick={() => {
                  setIsMCQSubmitted(true);
                  if (isMCQCorrect && !completedLessonIds.has(currentLesson.id)) {
                    toggleLessonComplete(currentLesson.id);
                  }
                }}
                sx={{
                  bgcolor: '#F97316',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  px: 3,
                  py: 0.75,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#EA580C', boxShadow: 'none' },
                  '&.Mui-disabled': { bgcolor: '#FED7AA', color: '#FFFFFF' },
                }}
              >
                Submit MCQ
              </Button>
            )}

            {/* Next Action */}
            <Button
              variant="text"
              onClick={handleNextStep}
              sx={{
                color: '#F97316',
                fontWeight: 800,
                fontSize: '0.86rem',
                textTransform: 'none',
                minWidth: 'auto',
                p: 0,
                '&:hover': { color: '#EA580C', bgcolor: 'transparent' },
              }}
            >
              Next
            </Button>
          </Box>

          {/* Right Action Container: Ask AI Coach */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Box
              component="button"
              onClick={() => toast.info('AI Coach is ready to assist you!', 'Ask AI Coach')}
              sx={{
                all: 'unset',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.7,
                borderRadius: '8px',
                bgcolor: '#0F172A',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.82rem',
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: '#1E293B' },
              }}
            >
              <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: '#F97316' }} />
              Ask AI Coach
            </Box>
          </Box>
        </Box>
      </Box>
    </StudentAppLayout>
  );
}

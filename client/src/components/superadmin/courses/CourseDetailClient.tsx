'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';
import { useAppSelector } from '@/store/hooks';

import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import ViewCertificateModal from '@/components/students/profile/ViewCertificateModal';
import ModuleAuthoringModal from './ModuleAuthoringModal';
import LessonAuthoringModal, { LessonAuthoringPayload } from './LessonAuthoringModal';
import BulkImportCurriculumModal from './BulkImportCurriculumModal';
import EditCourseModal from './EditCourseModal';
import { DEFAULT_LEARNING_OUTCOMES } from './CreateCourseModal';

import type { CourseDirectoryEntity, CourseCategory } from '@/types/course';
import type { StudentCertification } from '@/types/student-profile';
import type { EnrolledStudent, CourseAssignment, TopicItem, CourseDetailClientProps } from './detail/types';
import { getModuleTopicItems } from './detail/courseCatalogFallback';

import CourseDetailHeader from './detail/CourseDetailHeader';
import CourseCurriculumTab from './detail/CourseCurriculumTab';
import CourseRosterTab from './detail/CourseRosterTab';
import CourseAssignmentsTab from './detail/CourseAssignmentsTab';
import CourseCertificatesTab from './detail/CourseCertificatesTab';

export default function CourseDetailClient({
  course,
  role = 'superadmin',
}: CourseDetailClientProps) {
  const router = useRouter();
  const toast = useToast();
  const isStudent = role === 'student';

  const currentUser = useAppSelector((state) => state.auth.user);
  const [issuedCertDate, setIssuedCertDate] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'curriculum' | 'roster' | 'assignments' | 'certificates'>('curriculum');
  const [liveCourse, setLiveCourse] = useState<CourseDirectoryEntity>(course);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState<{ id?: string; title: string; description: string; index?: number } | null>(null);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [lessonToEdit, setLessonToEdit] = useState<{ id?: string; moduleIndex: number; lessonIndex: number; data: any } | null>(null);
  const [targetModuleForLesson, setTargetModuleForLesson] = useState<{ id?: string; index: number; title: string } | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isViewCertificateOpen, setIsViewCertificateOpen] = useState(false);
  const [isEditOutcomesOpen, setIsEditOutcomesOpen] = useState(false);
  const [editableOutcomes, setEditableOutcomes] = useState<string[]>([]);
  const [newOutcomeText, setNewOutcomeText] = useState('');
  const [isSavingOutcomes, setIsSavingOutcomes] = useState(false);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [userProgressPct, setUserProgressPct] = useState(0);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterStatusFilter, setRosterStatusFilter] = useState('ALL');

  const refreshLiveCourse = async (courseId?: string) => {
    try {
      const targetId = courseId || liveCourse.id || course.id;
      if (!targetId) return;
      const res = await apiService.getCourseById(targetId);
      if (res) {
        setLiveCourse(res);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    setLiveCourse(course);
  }, [course.id]);

  useEffect(() => {
    if (!isStudent) return;
    let isMounted = true;
    async function checkEnrollment() {
      try {
        const [enrolledList, me] = await Promise.all([
          apiService.getEnrolledCourses().catch(() => null),
          apiService.getMe().catch(() => null),
        ]);
        if (isMounted) {
          let found = false;
          let prog = 0;
          if (Array.isArray(enrolledList)) {
            const match = enrolledList.find(
              (e: any) =>
                e.courseId === course.id ||
                (e.course && (e.course.id === course.id || e.course.slug === course.slug)),
            );
            if (match) {
              found = true;
              prog = match.status === 'COMPLETED' ? 100 : (match.progressPct ?? 25);
              if (match.certificate?.issueDate || match.certificate?.issuedAt || match.completedAt) {
                setIssuedCertDate(match.certificate?.issueDate || match.certificate?.issuedAt || match.completedAt);
              }
            }
          }
          if (!found && me?.enrollments && Array.isArray(me.enrollments)) {
            const match = me.enrollments.find(
              (e: any) => e.courseId === course.id || e.course?.slug === course.slug,
            );
            if (match) {
              found = true;
              prog = match.progressPct ?? 25;
              if (match.certificate?.issueDate || match.certificate?.issuedAt || match.completedAt) {
                setIssuedCertDate(match.certificate?.issueDate || match.certificate?.issuedAt || match.completedAt);
              }
            }
          }
          setIsEnrolled(found);
          setUserProgressPct(prog);
        }
      } catch {
        // ignore
      }
    }
    checkEnrollment();
    return () => {
      isMounted = false;
    };
  }, [course.id, course.slug, isStudent]);

  const [liveRoster, setLiveRoster] = useState<EnrolledStudent[]>([]);
  const [isRosterLoading, setIsRosterLoading] = useState(false);

  useEffect(() => {
    if (isStudent) {
      setLiveRoster([]);
      setIsRosterLoading(false);
      return;
    }
    let isMounted = true;
    async function loadRoster() {
      const courseId = liveCourse.id || course.id;
      if (!courseId) return;
      setIsRosterLoading(true);
      try {
        const data = await apiService.getCourseRoster(courseId);
        if (isMounted) {
          const list = Array.isArray(data) ? data : (data?.items || data?.enrollments || []);
          const mapped: EnrolledStudent[] = list.map((item: any) => ({
            id: item.user?.id || item.userId || item.id || 'student',
            name: item.user?.name || item.name || 'Student',
            handle: item.user?.handle || item.user?.username || (item.user?.email ? item.user.email.split('@')[0] : 'student'),
            institution: item.user?.institution?.name || item.user?.college?.name || item.institution || '—',
            enrolledDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : (item.enrolledDate || '—'),
            progressPct: item.progressPct ?? item.progress ?? 0,
            completedLessons: item.completedLessonsCount ?? item.completedLessons ?? 0,
            quizScorePct: item.quizScorePct ?? item.averageScore ?? 0,
            lastActive: item.lastActiveAt ? new Date(item.lastActiveAt).toLocaleDateString() : (item.lastActive || '—'),
            status:
              item.status === 'ACTIVE' || item.status === 'In Progress'
                ? 'In Progress'
                : item.status === 'COMPLETED' || item.status === 'Completed'
                  ? 'Completed'
                  : 'Inactive',
          }));
          setLiveRoster(mapped);
        }
      } catch {
        if (isMounted) setLiveRoster([]);
      } finally {
        if (isMounted) setIsRosterLoading(false);
      }
    }
    loadRoster();
    return () => {
      isMounted = false;
    };
  }, [liveCourse.id, course.id, isStudent]);

  // Seeded Assignments Dataset
  const courseAssignments: CourseAssignment[] = useMemo(
    () => [
      {
        id: 'lab-01',
        title: 'Lab 1: Asymptotic Complexity & Benchmarking Harness',
        module: 'Module 1: Foundations & Architecture',
        type: 'Coding Lab',
        difficulty: 'Easy',
        submissionsCount: 1420,
        avgScore: 92,
        dueDate: 'Feb 15, 2025',
        status: 'Open',
      },
      {
        id: 'lab-02',
        title: 'Lab 2: Lock-Free Concurrent Queue Implementation',
        module: 'Module 2: Core Data Structures',
        type: 'Coding Lab',
        difficulty: 'Medium',
        submissionsCount: 1180,
        avgScore: 84,
        dueDate: 'Feb 28, 2025',
        status: 'Open',
      },
      {
        id: 'lab-03',
        title: 'Midterm Quiz: Protocol Proofs & State Machine Invariants',
        module: 'Module 3: Consensus & Protocols',
        type: 'Quiz',
        difficulty: 'Medium',
        submissionsCount: 1250,
        avgScore: 88,
        dueDate: 'Mar 10, 2025',
        status: 'Open',
      },
      {
        id: 'lab-04',
        title: 'Capstone Evaluation: High-Throughput Sharded Cluster Runner',
        module: 'Module 4: Capstone Architecture',
        type: 'Project Evaluation',
        difficulty: 'Hard',
        submissionsCount: 890,
        avgScore: 79,
        dueDate: 'Apr 01, 2025',
        status: 'Open',
      },
    ],
    []
  );

  const displayModules = useMemo(() => {
    if (liveCourse.modules && Array.isArray(liveCourse.modules) && liveCourse.modules.length > 0) {
      return liveCourse.modules;
    }
    if (liveCourse.moduleHighlights && Array.isArray(liveCourse.moduleHighlights) && liveCourse.moduleHighlights.length > 0) {
      return liveCourse.moduleHighlights.map((item: any, idx: number) => ({
        id: `highlight-${idx}`,
        title: typeof item === 'string' ? item : item.title || `Module ${idx + 1}`,
        description: typeof item === 'object' && item.description ? item.description : `Core curriculum unit #${idx + 1}`,
      }));
    }
    return [];
  }, [liveCourse]);

  const moduleTopicMap = useMemo(() => {
    const map: Record<number, TopicItem[]> = {};
    displayModules.forEach((_, idx) => {
      map[idx] = getModuleTopicItems(liveCourse, idx);
    });
    return map;
  }, [displayModules, liveCourse]);

  const allSubmoduleItems = useMemo(() => {
    return Object.values(moduleTopicMap).flat();
  }, [moduleTopicMap]);

  const completedCount = useMemo(() => {
    return allSubmoduleItems.filter((t) => t.isCompleted).length;
  }, [allSubmoduleItems]);

  const courseCompletionPct = useMemo(() => {
    if (allSubmoduleItems.length === 0) return userProgressPct || 0;
    return Math.round((completedCount / allSubmoduleItems.length) * 100);
  }, [allSubmoduleItems, completedCount, userProgressPct]);

  const isModuleUnlocked = (idx: number): boolean => {
    if (!isStudent) return true;
    if (idx === 0) return true;

    for (let i = 0; i < idx; i++) {
      const mod = displayModules[i];
      const topics = moduleTopicMap[i] || [];
      const hasPersistedLessons = Array.isArray((mod as any)?.lessons) && (mod as any).lessons.length > 0;
      const persistedTopics = topics.filter(
        (t) => hasPersistedLessons && t.id && !t.id.startsWith('local-') && !/^\d+-\d+$/.test(t.id)
      );
      if (persistedTopics.length > 0) {
        const allCompleted = persistedTopics.every((t) => t.isCompleted);
        if (!allCompleted) {
          return false;
        }
      }
    }
    return true;
  };

  const learningItems = useMemo(() => {
    if (Array.isArray(liveCourse.learningOutcomes) && liveCourse.learningOutcomes.length > 0) {
      return liveCourse.learningOutcomes;
    }
    if (Array.isArray(liveCourse.learningItems) && liveCourse.learningItems.length > 0) {
      return liveCourse.learningItems;
    }
    if (liveCourse.whatYouWillLearn && liveCourse.whatYouWillLearn.length > 0) {
      return liveCourse.whatYouWillLearn.map((item: any) => typeof item === 'string' ? item : item.title || item.description);
    }
    const cat = liveCourse.category as CourseCategory;
    if (cat && DEFAULT_LEARNING_OUTCOMES[cat]) {
      return DEFAULT_LEARNING_OUTCOMES[cat];
    }
    return [
      `Learn ${liveCourse.category || liveCourse.title} Syntax & Core Fundamentals`,
      'Problem Solving with Algorithmic Patterns',
      'Practice Conditionals, Loops & Recursion',
      '500 to 1350 Difficulty Rating Coding Labs',
      'Object-Oriented Programming (OOP) & Modularity',
      'Automated Sandbox Runner with Instant Verdicts',
    ];
  }, [liveCourse]);

  const totalProblemsCount = useMemo(() => {
    if (!displayModules || displayModules.length === 0) return 0;
    return displayModules.reduce((total, mod, idx) => {
      const topics = moduleTopicMap[idx] || getModuleTopicItems(liveCourse, idx);
      let count = 0;
      for (const t of topics) {
        if (Array.isArray(t.problems) && t.problems.length > 0) {
          count += t.problems.length;
        } else if (t.codingProblem || t.type === 'lab') {
          count += 1;
        }
      }
      return total + count;
    }, 0);
  }, [displayModules, liveCourse, moduleTopicMap]);

  const handleToggleModule = (idx: number) => {
    setExpandedModules((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleEnrollOrStart = async (lessonKey?: string) => {
    const courseId = liveCourse.id || course.id;
    if (!courseId) return;

    if (isStudent && !isEnrolled) {
      setIsEnrolling(true);
      try {
        await apiService.enrollInCourse(courseId);
        setIsEnrolled(true);
        toast.success(`Successfully enrolled in ${liveCourse.title}!`, 'Enrollment Confirmed');
      } catch (err: any) {
        const errorMsg = (err?.message || err?.response?.data?.message || '').toLowerCase();
        const isAlreadyEnrolled =
          err?.status === 409 ||
          err?.response?.status === 409 ||
          errorMsg.includes('already enrolled') ||
          errorMsg.includes('already registered');

        if (isAlreadyEnrolled) {
          setIsEnrolled(true);
        } else {
          toast.error(err?.message || 'Failed to enroll in course. Please try again.', 'Enrollment Error');
          return;
        }
      } finally {
        setIsEnrolling(false);
      }
    }

    const firstMod = displayModules[0];
    const firstTopics = moduleTopicMap[0] || getModuleTopicItems(liveCourse, 0);
    const lessonId = lessonKey || firstTopics[0]?.id || (firstMod as any)?.lessons?.[0]?.id || '0-0';
    const targetSlugOrId = liveCourse.slug || course.slug || courseId;
    const targetUrl = `/courses/${targetSlugOrId}/learn?lesson=${encodeURIComponent(lessonId)}`;
    router.push(targetUrl);
  };

  // Module Handlers
  const handleOpenAddModule = () => {
    setModuleToEdit(null);
    setIsAddModuleOpen(true);
  };

  const handleOpenEditModule = (mod: any, index: number) => {
    setModuleToEdit({
      id: mod.id,
      title: mod.title,
      description: mod.description || '',
      index,
    });
    setIsAddModuleOpen(true);
  };

  const handleSaveModule = async (data: { title: string; description: string }) => {
    try {
      if (moduleToEdit?.id) {
        await apiService.updateCourseModule(moduleToEdit.id, data);
        toast.success(`Module "${data.title}" updated successfully!`, 'Module Updated');
      } else {
        await apiService.createCourseModule(liveCourse.id || course.id, {
          title: data.title,
          description: data.description,
          order: liveCourse.modules?.length || 0,
        });
        toast.success(`Module "${data.title}" added to curriculum!`, 'Module Created');
      }
      await refreshLiveCourse();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save module.', 'Module Save Failed');
      throw err;
    }
  };

  const handleDeleteModule = async (moduleIndex: number, moduleId?: string) => {
    if (!window.confirm('Are you sure you want to delete this module and all its submodules?')) return;
    try {
      if (moduleId && !moduleId.startsWith('mod-') && !moduleId.startsWith('highlight-')) {
        await apiService.deleteCourseModule(moduleId);
      }
      setLiveCourse((prev) => {
        const nextModules = [...(prev.modules || [])];
        if (nextModules.length > moduleIndex) {
          nextModules.splice(moduleIndex, 1);
        }
        return {
          ...prev,
          modules: nextModules,
          modulesCount: nextModules.length,
        };
      });
      toast.success('Curriculum module deleted.', 'Module Deleted');
      await refreshLiveCourse();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete module.', 'Delete Failed');
    }
  };

  const handleReorderModule = async (moduleIndex: number, direction: 'up' | 'down') => {
    const currentMods = [...(liveCourse.modules || [])];
    const targetIndex = direction === 'up' ? moduleIndex - 1 : moduleIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentMods.length) return;

    const [moved] = currentMods.splice(moduleIndex, 1);
    currentMods.splice(targetIndex, 0, moved);

    setLiveCourse((prev) => ({
      ...prev,
      modules: currentMods,
    }));

    try {
      const payload = currentMods
        .filter((m) => m.id && !m.id.startsWith('highlight-'))
        .map((m, idx) => ({ id: m.id, order: idx }));
      if (payload.length > 0) {
        await apiService.reorderCourseModules(liveCourse.id || course.id, payload);
      }
    } catch (err) {
      console.warn('Module reorder sync note:', err);
    }
  };

  // Submodule / Lesson Handlers
  const handleOpenAddLesson = (mod: any, moduleIndex: number) => {
    setTargetModuleForLesson({
      id: mod.id,
      index: moduleIndex,
      title: mod.title,
    });
    setLessonToEdit(null);
    setIsAddLessonOpen(true);
  };

  const handleOpenEditLesson = (lessonItem: any, mod: any, moduleIndex: number) => {
    setTargetModuleForLesson({
      id: lessonItem.moduleId || mod.id,
      index: moduleIndex,
      title: mod.title,
    });
    const rawLesson = mod?.lessons?.find((l: any) => l.id === lessonItem.id);
    setLessonToEdit({
      id: lessonItem.id,
      moduleIndex,
      lessonIndex: 0,
      data: rawLesson
        ? {
            ...lessonItem,
            ...rawLesson,
            durationMinutes: typeof rawLesson.durationMinutes === 'number' ? rawLesson.durationMinutes : lessonItem.durationMinutes,
          }
        : lessonItem,
    });
    setIsAddLessonOpen(true);
  };

  const handleSaveLesson = async (payload: LessonAuthoringPayload) => {
    try {
      const targetModule = liveCourse.modules?.[targetModuleForLesson?.index ?? 0];
      const isPersisted = Boolean(
        lessonToEdit?.id &&
        !lessonToEdit.id.startsWith('local-') &&
        targetModule?.lessons?.some((l: any) => l.id === lessonToEdit.id)
      );

      if (isPersisted && lessonToEdit?.id) {
        await apiService.updateCourseLesson(lessonToEdit.id, payload);
        toast.success(`Submodule "${payload.title}" updated!`, 'Submodule Saved');
      } else {
        const moduleId = targetModuleForLesson?.id || targetModule?.id;
        if (!moduleId || moduleId.startsWith('highlight-')) {
          toast.error('Please create/save the parent module on the server first before adding lessons.', 'Action Required');
          return;
        }
        await apiService.createCourseLesson(moduleId, {
          ...payload,
          order: targetModule?.lessons?.length || 0,
        });
        toast.success(`Submodule "${payload.title}" added to curriculum!`, 'Submodule Created');
      }
      await refreshLiveCourse();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save submodule.', 'Save Failed');
      throw err;
    }
  };

  const handleDeleteLesson = async (lessonId: string, moduleIndex: number) => {
    if (!lessonId || lessonId.startsWith('local-') || /^\d+-\d+$/.test(lessonId)) {
      toast.info('Local template lessons cannot be deleted until saved to a persisted module.', 'Action Unavailable');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this submodule?')) return;
    try {
      await apiService.deleteCourseLesson(lessonId);
      toast.success('Submodule deleted from curriculum.', 'Lesson Deleted');
      await refreshLiveCourse();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete lesson.', 'Delete Failed');
    }
  };

  const courseLanguage = (liveCourse as any).language ||
    liveCourse.tags?.find((t) => ['Python', 'C++', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'Go', 'Rust', 'React'].includes(t)) ||
    (liveCourse.category?.includes('DSA') ? 'DSA' : liveCourse.tags?.[0] || 'Python');

  const badgeCode = ['Python', 'C++', 'DSA', 'React', 'Cloud', 'SQL'].find((b) =>
    courseLanguage.toLowerCase().includes(b.toLowerCase()) || liveCourse.title.toLowerCase().includes(b.toLowerCase())
  ) || courseLanguage;

  const studentDisplayName = currentUser
    ? (currentUser.name || currentUser.handle || currentUser.email || 'Student Learner')
    : 'Student Learner';

  const sampleCertification: StudentCertification = {
    id: `cert-${liveCourse.id || 'course'}`,
    title: liveCourse.title,
    badgeCode: badgeCode,
    language: courseLanguage,
    stars: 5,
    issueDate: issuedCertDate || new Date().toISOString(),
    issuer: liveCourse.institutionName || 'CodePlatform Academic Board',
    credentialId: issuedCertDate ? `CERT-${liveCourse.id}` : `PREVIEW-CERT-${liveCourse.id || '10928'}`,
    skills: liveCourse.tags?.length ? liveCourse.tags : ['Data Structures', 'Algorithms'],
  };

  const handleAddEditableOutcome = () => {
    if (!newOutcomeText.trim()) return;
    setEditableOutcomes((prev) => [...prev, newOutcomeText.trim()]);
    setNewOutcomeText('');
  };

  const handleRemoveEditableOutcome = (idx: number) => {
    setEditableOutcomes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleResetEditableOutcomes = () => {
    const cat = liveCourse.category as CourseCategory;
    const defaults = (cat && DEFAULT_LEARNING_OUTCOMES[cat]) ? DEFAULT_LEARNING_OUTCOMES[cat] : [
      `Learn ${liveCourse.category || liveCourse.title} Syntax & Core Fundamentals`,
      'Problem Solving with Algorithmic Patterns',
      'Practice Conditionals, Loops & Recursion',
      '500 to 1350 Difficulty Rating Coding Labs',
      'Object-Oriented Programming (OOP) & Modularity',
      'Automated Sandbox Runner with Instant Verdicts',
    ];
    setEditableOutcomes([...defaults]);
  };

  const handleSaveOutcomesToBackend = async () => {
    setIsSavingOutcomes(true);
    try {
      const courseId = liveCourse.id || course.id;
      if (courseId) {
        await apiService.updateCourse(courseId, {
          learningOutcomes: editableOutcomes,
        });
      }
      setLiveCourse((prev) => ({
        ...prev,
        learningOutcomes: editableOutcomes,
      }));
      toast.success('Learning outcomes updated successfully!', 'Course Updated');
      setIsEditOutcomesOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save learning outcomes.', 'Update Failed');
    } finally {
      setIsSavingOutcomes(false);
    }
  };

  const innerContent = (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* 1. Header & Hero Banner */}
      <CourseDetailHeader
        course={liveCourse}
        isStudent={isStudent}
        isStudioMode={!isStudent}
        isEnrolled={isEnrolled}
        isEnrolling={isEnrolling}
        courseCompletionPct={courseCompletionPct}
        totalProblemsCount={totalProblemsCount}
        learningItems={learningItems}
        onEditCourse={() => setIsEditCourseModalOpen(true)}
        onEnrollOrStart={handleEnrollOrStart}
        firstLessonKey={allSubmoduleItems[0]?.id || '0-0'}
      />

      {/* 2. Tabs Navigation */}
      <Box sx={{ borderBottom: '1px solid #E2E8F0' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            '& .MuiTabs-indicator': { bgcolor: '#2563EB', height: 3, borderRadius: '3px 3px 0 0' },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.92rem',
              color: '#64748B',
              minWidth: 120,
              '&.Mui-selected': { color: '#2563EB' },
            },
          }}
        >
          <Tab value="curriculum" label={`Curriculum Units (${displayModules.length})`} />
          {!isStudent && <Tab value="roster" label={`Enrolled Students (${liveRoster.length})`} />}
          <Tab value="assignments" label={`Assignments (${courseAssignments.length})`} />
          <Tab value="certificates" label="Accreditation & Certificate" />
        </Tabs>
      </Box>

      {/* 3. Tab Contents */}
      {activeTab === 'curriculum' && (
        <CourseCurriculumTab
          course={liveCourse}
          displayModules={displayModules}
          expandedModules={expandedModules}
          onToggleModule={handleToggleModule}
          moduleTopicMap={moduleTopicMap}
          isStudent={isStudent}
          isStudioMode={!isStudent}
          courseCompletionPct={courseCompletionPct}
          completedCount={completedCount}
          allSubmoduleItems={allSubmoduleItems}
          onOpenAddModule={handleOpenAddModule}
          onOpenEditModule={handleOpenEditModule}
          onOpenAddLesson={handleOpenAddLesson}
          onOpenEditLesson={handleOpenEditLesson}
          onReorderModule={handleReorderModule}
          onDeleteModule={handleDeleteModule}
          onDeleteLesson={handleDeleteLesson}
          onEnrollOrStart={handleEnrollOrStart}
          isEnrolling={isEnrolling}
          isModuleUnlocked={isModuleUnlocked}
          onBulkImport={() => setIsBulkImportOpen(true)}
          onEditOutcomes={() => {
            setEditableOutcomes([...learningItems]);
            setIsEditOutcomesOpen(true);
          }}
        />
      )}

      {!isStudent && activeTab === 'roster' && (
        <CourseRosterTab
          students={liveRoster}
          rosterSearch={rosterSearch}
          onRosterSearchChange={setRosterSearch}
          rosterStatusFilter={rosterStatusFilter}
          onRosterStatusFilterChange={setRosterStatusFilter}
        />
      )}

      {activeTab === 'assignments' && (
        <CourseAssignmentsTab
          assignments={courseAssignments}
          isStudent={isStudent}
        />
      )}

      {activeTab === 'certificates' && (
        <CourseCertificatesTab
          course={liveCourse}
          isStudent={isStudent}
          onViewCertificate={() => setIsViewCertificateOpen(true)}
        />
      )}

      {/* Module Authoring Modal */}
      <ModuleAuthoringModal
        open={isAddModuleOpen}
        onClose={() => setIsAddModuleOpen(false)}
        onSave={handleSaveModule}
        initialData={moduleToEdit ? { id: moduleToEdit.id, title: moduleToEdit.title, description: moduleToEdit.description } : null}
        isEditing={Boolean(moduleToEdit?.id)}
      />

      {/* Lesson Authoring Modal */}
      <LessonAuthoringModal
        open={isAddLessonOpen}
        onClose={() => setIsAddLessonOpen(false)}
        onSave={handleSaveLesson}
        moduleTitle={targetModuleForLesson?.title || 'Target Module'}
        initialData={lessonToEdit?.data}
        isEditing={Boolean(
          lessonToEdit?.id &&
          !lessonToEdit.id.startsWith('local-') &&
          liveCourse.modules?.[targetModuleForLesson?.index ?? 0]?.lessons?.some((l: any) => l.id === lessonToEdit.id)
        )}
      />

      {/* Bulk Import Curriculum Modal */}
      <BulkImportCurriculumModal
        open={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        courseId={liveCourse.id || course.id}
        onImportSuccess={() => refreshLiveCourse()}
      />

      {/* Certificate Viewer Modal */}
      <ViewCertificateModal
        open={isViewCertificateOpen}
        onClose={() => setIsViewCertificateOpen(false)}
        cert={sampleCertification}
        studentName={studentDisplayName}
      />

      {/* Edit Outcomes Dialog */}
      <Dialog
        open={isEditOutcomesOpen}
        onClose={() => !isSavingOutcomes && setIsEditOutcomesOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '20px',
              p: 0.5,
              border: '1px solid #E2E8F0',
            },
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
                Edit &apos;What You Will Learn&apos; Points
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '0.82rem', mt: 0.25 }}>
                Custom learning outcomes displayed on the course hero card.
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setIsEditOutcomesOpen(false)}
              disabled={isSavingOutcomes}
              sx={{ color: '#94A3B8' }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Master Asymptotic Big-O Analysis & Graph Algorithms..."
              value={newOutcomeText}
              onChange={(e) => setNewOutcomeText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddEditableOutcome();
                }
              }}
              disabled={isSavingOutcomes}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.88rem',
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddEditableOutcome}
              disabled={!newOutcomeText.trim() || isSavingOutcomes}
              startIcon={<AddRoundedIcon />}
              sx={{
                borderRadius: '12px',
                bgcolor: '#2563EB',
                textTransform: 'none',
                fontWeight: 700,
                px: 2.2,
                py: 0.9,
                whiteSpace: 'nowrap',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              Add Point
            </Button>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              p: 1.5,
              bgcolor: '#F8FAFC',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              maxHeight: 280,
              overflowY: 'auto',
            }}
          >
            {editableOutcomes.length === 0 ? (
              <Typography sx={{ fontSize: '0.84rem', color: '#94A3B8', textAlign: 'center', py: 2 }}>
                No points configured yet.
              </Typography>
            ) : (
              editableOutcomes.map((item, idx) => (
                <Box
                  key={`edit-outcome-${idx}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    p: 1.25,
                    bgcolor: '#FFFFFF',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flex: 1, minWidth: 0 }}>
                    <CheckRoundedIcon sx={{ fontSize: 18, color: '#2563EB', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.86rem', color: '#1E293B', fontWeight: 600 }}>
                      {item}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveEditableOutcome(idx)}
                    disabled={isSavingOutcomes}
                    sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' } }}
                  >
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                </Box>
              ))
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              size="small"
              onClick={handleResetEditableOutcomes}
              disabled={isSavingOutcomes}
              startIcon={<RestartAltRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{ textTransform: 'none', fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}
            >
              Reset to Recommended Defaults
            </Button>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              {editableOutcomes.length} points defined
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setIsEditOutcomesOpen(false)}
            disabled={isSavingOutcomes}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              color: '#475569',
              borderColor: '#CBD5E1',
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveOutcomesToBackend}
            disabled={isSavingOutcomes}
            startIcon={isSavingOutcomes ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: '10px',
              bgcolor: '#2563EB',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            {isSavingOutcomes ? 'Saving to Database...' : 'Save Learning Points'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Core Course Details Modal */}
      <EditCourseModal
        open={isEditCourseModalOpen}
        onClose={() => setIsEditCourseModalOpen(false)}
        course={liveCourse}
        onUpdated={(updated) => {
          setLiveCourse((prev) => ({ ...prev, ...updated }));
          refreshLiveCourse(liveCourse.id || course.id);
        }}
      />
    </Box>
  );

  if (isStudent) {
    return <StudentAppLayout>{innerContent}</StudentAppLayout>;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#F8FAFC',
        color: '#0F172A',
        p: { xs: 1.5, sm: 2, md: 2.5 },
        pl: { xs: '82px', sm: '90px', md: '102px' },
        gap: { xs: 2, md: 3 },
      }}
    >
      <FloatingSidebar />
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box
          sx={{
            maxWidth: 1400,
            width: '100%',
            mx: 'auto',
            px: { xs: 2.5, md: 4.5 },
            display: 'flex',
            flexDirection: 'column',
            gap: 3.5,
            pb: { xs: 4, md: 6 },
          }}
        >
          <Navbar />
          {innerContent}
        </Box>
      </Box>
    </Box>
  );
}

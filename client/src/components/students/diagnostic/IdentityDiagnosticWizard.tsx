'use client';

import React, { useState, useEffect } from 'react';
import { Box, Card, Dialog, DialogContent } from '@mui/material';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';

import {
  CareerTrack,
  CAREER_TRACKS,
  DiagnosticQuestion,
  TRACK_QUESTIONS,
  IdentityDiagnosticWizardProps,
  STEP_ITEMS,
} from './wizard/types';
import { WizardHeaderStepper } from './wizard/WizardHeaderStepper';
import { TrackSelectionStep } from './wizard/TrackSelectionStep';
import { SkillAssessmentStep } from './wizard/SkillAssessmentStep';
import { CalibrationQuizStep } from './wizard/CalibrationQuizStep';
import { CuratedRoadmapStep } from './wizard/CuratedRoadmapStep';
import { WizardFooterToolbar } from './wizard/WizardFooterToolbar';

// Re-export types & constants for backwards compatibility
export type { CareerTrack, DiagnosticQuestion, IdentityDiagnosticWizardProps };
export { CAREER_TRACKS, TRACK_QUESTIONS, STEP_ITEMS };

export function IdentityDiagnosticWizard({
  open = true,
  onClose = () => {},
  onComplete,
  isModal = true,
  initialTrack = 'fullstack',
}: IdentityDiagnosticWizardProps) {
  const { showToast } = useToast();

  // Wizard Navigation
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedTrack, setSelectedTrack] = useState<string>(initialTrack);

  // Skill Self-Ratings (1-5 scale)
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>({
    frontend: 3,
    backend: 3,
    dsa: 3,
    database: 3,
    devops: 2,
    system_design: 2,
  });

  // Quiz Answers
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState<number>(0);

  // Weekly Goals
  const [targetWeeklyHours, setTargetWeeklyHours] = useState<number>(10);
  const [targetProblemsPerWeek, setTargetProblemsPerWeek] = useState<number>(15);

  // Real courses fetched from database
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());

  // Saving state
  const [savingGoals, setSavingGoals] = useState<boolean>(false);

  // Fetch real platform courses
  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await apiService.getCourses();
        const courses = (res as any)?.courses || (res as any)?.data || (Array.isArray(res) ? res : []);
        setAllCourses(courses);

        const enrolled = new Set<string>();
        courses.forEach((c: any) => {
          if (c.enrolled || c.isEnrolled || c.userEnrollment) {
            enrolled.add(c.id);
          }
        });
        setEnrolledCourseIds(enrolled);
      } catch (err) {
        console.warn('Failed to load courses for diagnostic wizard', err);
      }
    }
    loadCourses();
  }, []);

  const activeTrackObj = CAREER_TRACKS.find((t) => t.id === selectedTrack) || CAREER_TRACKS[0];
  const targetRole = activeTrackObj?.targetRole || activeTrackObj?.title || 'Full-Stack Software Engineer';
  const questionsForTrack = TRACK_QUESTIONS[selectedTrack] || TRACK_QUESTIONS.fullstack;

  // Handle Quiz answer
  const handleSelectAnswer = (qId: string, optionKey: string) => {
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionKey }));
  };

  // Evaluate Quiz
  const handleEvaluateQuiz = () => {
    let correctCount = 0;
    questionsForTrack.forEach((q) => {
      if (quizAnswers[q.id] === q.correctKey) {
        correctCount += 1;
      }
    });
    const calculatedPercentage = Math.round((correctCount / questionsForTrack.length) * 100);
    setQuizScore(calculatedPercentage);
    setCurrentStep(4);
  };

  // 1-Click Course Enroll
  const handleEnrollCourse = async (courseId: string) => {
    try {
      setEnrollingCourseId(courseId);
      await apiService.enrollInCourse(courseId);
      setEnrolledCourseIds((prev) => new Set([...prev, courseId]));
      showToast('Successfully enrolled in recommended course!', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to enroll';
      if (msg.toLowerCase().includes('already enrolled')) {
        setEnrolledCourseIds((prev) => new Set([...prev, courseId]));
        showToast('You are already enrolled in this course!', 'info');
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Apply Diagnostic & Goals to Backend
  const handleApplyGoals = async () => {
    setSavingGoals(true);
    try {
      const diagnosticPayload = {
        targetTrack: selectedTrack,
        skillRatings,
        quizScore,
        completedAt: new Date().toISOString(),
      };

      try {
        if ((apiService as any).saveStudentDiagnostic) {
          await (apiService as any).saveStudentDiagnostic(diagnosticPayload);
        } else if ((apiService as any).updateStudentDiagnostic) {
          await (apiService as any).updateStudentDiagnostic(diagnosticPayload);
        }
      } catch (e) {
        console.warn('Backend saveStudentDiagnostic fallback', e);
      }

      const goalsPayload = {
        targetRole,
        primaryTrack: selectedTrack,
        targetWeeklyHours,
        targetProblemsPerWeek,
        diagnosticScore: quizScore,
      };

      try {
        if ((apiService as any).saveStudentGoals) {
          await (apiService as any).saveStudentGoals(goalsPayload);
        } else if ((apiService as any).updateStudentGoals) {
          await (apiService as any).updateStudentGoals(goalsPayload);
        }
      } catch (e) {
        console.warn('Backend saveStudentGoals fallback', e);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('student_diagnostic_completed', 'true');
        localStorage.setItem(
          'student_diagnostic_result',
          JSON.stringify({
            ...diagnosticPayload,
            ...goalsPayload,
          })
        );
      }

      showToast('Career diagnostic & goals successfully calibrated!', 'success');

      if (onComplete) {
        onComplete({
          track: selectedTrack,
          score: quizScore,
          goals: goalsPayload,
        });
      }
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save goals', 'error');
    } finally {
      setSavingGoals(false);
    }
  };

  // Calculate matching recommended courses for the active track
  const recommendedCourses = allCourses.filter((c) => {
    const text = `${c.title} ${c.description || ''} ${c.category || ''} ${c.slug || ''}`.toLowerCase();
    if (selectedTrack === 'fullstack') {
      return text.includes('web') || text.includes('react') || text.includes('full') || text.includes('node') || text.includes('next');
    }
    if (selectedTrack === 'backend') {
      return text.includes('back') || text.includes('node') || text.includes('nest') || text.includes('database') || text.includes('sql') || text.includes('system');
    }
    if (selectedTrack === 'dsa') {
      return text.includes('algo') || text.includes('data structure') || text.includes('dsa') || text.includes('python') || text.includes('c++') || text.includes('java');
    }
    if (selectedTrack === 'cloud_devops') {
      return text.includes('cloud') || text.includes('devops') || text.includes('docker') || text.includes('linux');
    }
    if (selectedTrack === 'ai_ml') {
      return text.includes('ai') || text.includes('ml') || text.includes('machine') || text.includes('python') || text.includes('data');
    }
    if (selectedTrack === 'security') {
      return text.includes('security') || text.includes('cyber') || text.includes('network');
    }
    return true;
  }).slice(0, 3);

  const displayCourses = recommendedCourses.length > 0 ? recommendedCourses : allCourses.slice(0, 3);

  const wizardContent = (
    <Box sx={{ bgcolor: '#FFFFFF', color: '#0F172A', borderRadius: '16px', overflow: 'hidden' }}>
      {/* 1. Header & Stepper */}
      <WizardHeaderStepper
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        isModal={isModal}
        onClose={onClose}
      />

      {/* 2. Step Contents */}
      <Box sx={{ p: { xs: 2.5, md: 4 }, bgcolor: '#FFFFFF', minHeight: 460 }}>
        {currentStep === 1 && (
          <TrackSelectionStep
            selectedTrack={selectedTrack}
            onSelectTrack={(trackId) => {
              setSelectedTrack(trackId);
              setQuizAnswers({});
            }}
          />
        )}

        {currentStep === 2 && (
          <SkillAssessmentStep
            activeTrackObj={activeTrackObj}
            skillRatings={skillRatings}
            onSkillRatingChange={(key, val) =>
              setSkillRatings((prev) => ({ ...prev, [key]: val }))
            }
            onChangeTrack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <CalibrationQuizStep
            activeTrackObj={activeTrackObj}
            questionsForTrack={questionsForTrack}
            quizAnswers={quizAnswers}
            onSelectAnswer={handleSelectAnswer}
          />
        )}

        {currentStep === 4 && (
          <CuratedRoadmapStep
            activeTrackObj={activeTrackObj}
            quizScore={quizScore}
            displayCourses={displayCourses}
            enrolledCourseIds={enrolledCourseIds}
            enrollingCourseId={enrollingCourseId}
            onEnrollCourse={handleEnrollCourse}
            targetProblemsPerWeek={targetProblemsPerWeek}
            setTargetProblemsPerWeek={setTargetProblemsPerWeek}
            targetWeeklyHours={targetWeeklyHours}
            setTargetWeeklyHours={setTargetWeeklyHours}
          />
        )}
      </Box>

      {/* 3. Footer Navigation Bar */}
      <WizardFooterToolbar
        currentStep={currentStep}
        savingGoals={savingGoals}
        onPrevious={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
        onContinue={() => setCurrentStep((prev) => prev + 1)}
        onEvaluate={handleEvaluateQuiz}
        onApplyGoals={handleApplyGoals}
      />
    </Box>
  );

  if (!isModal) {
    return (
      <Card
        sx={{
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
          overflow: 'hidden',
        }}
      >
        {wizardContent}
      </Card>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            color: '#0F172A',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
            overflow: 'hidden',
            border: '1px solid #E2E8F0',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {wizardContent}
      </DialogContent>
    </Dialog>
  );
}

export default IdentityDiagnosticWizard;

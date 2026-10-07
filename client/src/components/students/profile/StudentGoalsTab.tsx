'use client';

import React, { useState, useEffect } from 'react';
import { Box, Dialog, DialogContent } from '@mui/material';
import dynamic from 'next/dynamic';
import { StudentProfileData } from '@/types/student-profile';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';
import { UserGoalData, DEFAULT_GOAL, normalizeTimeline } from './goals/types';
import GoalHeroSummary from './goals/GoalHeroSummary';
import VelocityCadenceGrid from './goals/VelocityCadenceGrid';
import SkillsRoadmapSection from './goals/SkillsRoadmapSection';
import { GoalCustomizerModal } from './goals/GoalCustomizerModal';

const IdentityDiagnosticWizard = dynamic(
  () => import('@/components/students/diagnostic/IdentityDiagnosticWizard'),
  { ssr: false }
);

interface StudentGoalsTabProps {
  profile: StudentProfileData;
  isOwner?: boolean;
  onOpenDiagnostic?: () => void;
}

export default function StudentGoalsTab({
  profile,
  isOwner = true,
  onOpenDiagnostic,
}: StudentGoalsTabProps) {
  const toast = useToast();
  const [goalData, setGoalData] = useState<UserGoalData>(DEFAULT_GOAL);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [formData, setFormData] = useState<UserGoalData>(DEFAULT_GOAL);

  useEffect(() => {
    let isMounted = true;

    async function loadGoals() {
      // 1. Check backend API first (only for owner)
      if (isOwner) {
        try {
          const remote = await apiService.getStudentGoals();
          if (remote && remote.targetTrack && isMounted) {
            setGoalData((prev) => ({ ...prev, ...remote }));
            setFormData((prev) => ({ ...prev, ...remote }));
            return;
          }
        } catch (err) {
          console.warn('Could not load goals from API, checking local storage:', err);
        }
      }

      // 2. Local storage fallback
      if (typeof window !== 'undefined') {
        try {
          const storageKey = profile?.id ? `codeplatform_diagnostic_goal_${profile.id}` : 'codeplatform_diagnostic_goal';
          const stored = localStorage.getItem(storageKey);
          if (stored && isMounted) {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed.targetTrack === 'string' && Array.isArray(parsed.skills)) {
              setGoalData((prev) => ({ ...prev, ...parsed }));
              setFormData((prev) => ({ ...prev, ...parsed }));
            }
          }
        } catch {}
      }
    }

    loadGoals();

    return () => {
      isMounted = false;
    };
  }, [profile?.id, isOwner]);

  const [customizerTab, setCustomizerTab] = useState(0);

  const handleOpenCustomizer = (initialTab: number = 0) => {
    setCustomizerTab(initialTab);
    setFormData({ ...goalData });
    setCustomizerOpen(true);
  };

  const handleSaveCustomForm = async () => {
    const clamp = (val: number | undefined, min: number, max: number, defaultVal: number) => {
      if (val === undefined || isNaN(val)) return defaultVal;
      return Math.min(Math.max(val, min), max);
    };

    const clampedQuota = clamp(formData.weeklyProblemQuota, 5, 60, 20);
    const clampedRating = clamp(formData.targetContestRating, 1000, 2800, 1800);
    const clampedFirstAttempt = clamp(formData.firstAttemptTargetRate, 50, 99, 75);

    const avgSkill = Math.round(
      formData.skills.reduce((acc, curr) => acc + curr.level, 0) / (formData.skills.length || 1)
    );
    const updated: UserGoalData = {
      ...formData,
      weeklyProblemQuota: clampedQuota,
      targetContestRating: clampedRating,
      firstAttemptTargetRate: clampedFirstAttempt,
      roleFitScore: avgSkill,
      timestamp: new Date().toISOString(),
    };
    setGoalData(updated);
    if (typeof window !== 'undefined') {
      try {
        const storageKey = profile?.id ? `codeplatform_diagnostic_goal_${profile.id}` : 'codeplatform_diagnostic_goal';
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
    }

    try {
      await apiService.saveStudentGoals(updated);
    } catch (err) {
      console.warn('Could not sync goals to backend:', err);
    }

    toast.showToast('Target goals, speed limits & baseline skills calibrated successfully!', 'success');
    setCustomizerOpen(false);
  };

  const handleSaveUpdatedGoal = (newReport: any) => {
    const cleanSkills = Array.isArray(newReport?.skills)
      ? newReport.skills.map((s: any) => ({
          id: s.id,
          name: s.name,
          level: typeof s.level === 'number' ? s.level : 50,
          label: s.label || 'Intermediate',
        }))
      : undefined;

    const normalizedTimeline = newReport?.timeline ? normalizeTimeline(newReport.timeline) : undefined;

    const updated = {
      ...newReport,
      ...(cleanSkills ? { skills: cleanSkills } : {}),
      ...(normalizedTimeline ? { timeline: normalizedTimeline } : {}),
    };

    setGoalData((prev) => ({ ...prev, ...updated }));
    setFormData((prev) => ({ ...prev, ...updated }));
    if (typeof window !== 'undefined') {
      try {
        const storageKey = profile?.id ? `codeplatform_diagnostic_goal_${profile.id}` : 'codeplatform_diagnostic_goal';
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
    }

    setWizardOpen(false);
  };

  const currentStreak = goalData.streakDays ?? profile?.currentStreakDays ?? 0;
  const currentAccRate = profile?.accuracyRate ? parseFloat(profile.accuracyRate.replace('%', '')) : (goalData.currentFirstAttemptRate ?? 75);
  const currentRating = profile?.contestRating ?? goalData.currentContestRating ?? 1500;
  const currentSolveTime = goalData.currentAvgSolveTimeMins ?? 20;

  const targetSolveTime = goalData.targetSolveTimeMins ?? 18;
  const solveDelta = currentSolveTime - targetSolveTime;
  const solveDeltaText = solveDelta > 0 ? `+${solveDelta.toFixed(1)}m gap` : solveDelta < 0 ? `${solveDelta.toFixed(1)}m faster` : 'On target';

  const dailyPercentage = Math.min(100, Math.round(((goalData.dailyLoggedMins ?? 0) / (goalData.dailyGoalMins || 60)) * 100));
  const weeklyPercentage = Math.min(100, Math.round(((goalData.weeklyProblemsSolved ?? 0) / (goalData.weeklyProblemQuota || 20)) * 100));

  const targetAcc = goalData.firstAttemptTargetRate ?? 85;
  const accGap = targetAcc - currentAccRate;
  const accGapText = accGap > 0 ? `Gap: ${accGap.toFixed(1)}%` : 'Target met';

  const targetRating = goalData.targetContestRating ?? 1850;
  const ratingGap = targetRating - currentRating;
  const ratingGapText = ratingGap > 0 ? `+${ratingGap} gap` : 'Target met';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 1. Top Hero Summary */}
      <GoalHeroSummary
        goalData={goalData}
        isOwner={isOwner}
        currentStreak={currentStreak}
        targetSolveTime={targetSolveTime}
        dailyPercentage={dailyPercentage}
        onOpenCustomizer={handleOpenCustomizer}
        onOpenWizard={() => {
          if (onOpenDiagnostic) onOpenDiagnostic();
          else setWizardOpen(true);
        }}
      />

      {/* 2. Velocity & Cadence Grid */}
      <VelocityCadenceGrid
        goalData={goalData}
        targetSolveTime={targetSolveTime}
        currentSolveTime={currentSolveTime}
        solveDeltaText={solveDeltaText}
        dailyPercentage={dailyPercentage}
        weeklyPercentage={weeklyPercentage}
        targetAcc={targetAcc}
        currentAccRate={currentAccRate}
        accGapText={accGapText}
        targetRating={targetRating}
        currentRating={currentRating}
        ratingGapText={ratingGapText}
        onOpenCustomizer={handleOpenCustomizer}
      />

      {/* 3. Skills Matrix & Dynamic Action Roadmap */}
      <SkillsRoadmapSection
        goalData={goalData}
        onOpenCustomizer={handleOpenCustomizer}
      />

      {/* 4. Goal Customization Form Modal */}
      <GoalCustomizerModal
        open={customizerOpen}
        initialTab={customizerTab}
        onClose={() => setCustomizerOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveCustomForm}
        onOpenWizard={() => {
          setCustomizerOpen(false);
          setWizardOpen(true);
        }}
      />

      {/* 5. Recalibrate Wizard Dialog */}
      <Dialog
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
              backgroundImage: 'none',
            },
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <IdentityDiagnosticWizard
            isModal={true}
            userId={profile?.id}
            onClose={() => setWizardOpen(false)}
            onComplete={handleSaveUpdatedGoal}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

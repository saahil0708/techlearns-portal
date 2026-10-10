import { Metadata } from 'next';
import { apiService } from '@/lib/api-service';
import ExternalAssessmentClient from '@/components/assessments/ExternalAssessmentClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    candidate?: string;
    email?: string;
    name?: string;
    roll?: string;
    rollNo?: string;
    college?: string;
    institution?: string;
    code?: string;
    token?: string;
    status?: string;
  }>;
}

async function resolveContestData(idOrSlug: string) {
  try {
    const live = await apiService.getContestById(idOrSlug);
    if (live && live.id) {
      return live;
    }
  } catch (err) {
    console.warn('Could not resolve contest from API, using default proctored session context:', err);
  }

  // Graceful standard session fallback
  return {
    id: idOrSlug,
    title: 'SkillOS Institutional Technical Evaluation 2026',
    description: 'Proctored standardized competitive programming and algorithmic evaluation for candidates.',
    durationMinutes: 90,
    institution: {
      name: 'Department of Computer Science & Engineering',
    },
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const contest = await resolveContestData(id);

  return {
    title: `${contest.title || 'SkillOS Assessment'} | Secure Candidate Evaluation`,
    description: 'Secure AI-proctored technical assessment gateway for candidate evaluations.',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ExternalAssessmentPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const candidateEmail = resolvedSearchParams?.candidate || resolvedSearchParams?.email;
  const candidateName = resolvedSearchParams?.name;
  const candidateRoll = resolvedSearchParams?.roll || resolvedSearchParams?.rollNo;
  const candidateCollege = resolvedSearchParams?.college || resolvedSearchParams?.institution;
  const contestData = await resolveContestData(id);

  return (
    <ExternalAssessmentClient
      assessmentId={id}
      contestData={contestData}
      prefilledEmail={candidateEmail}
      prefilledName={candidateName}
      prefilledRoll={candidateRoll}
      prefilledCollege={candidateCollege}
      accessCodeParam={resolvedSearchParams?.code || resolvedSearchParams?.token}
      statusParam={resolvedSearchParams?.status}
    />
  );
}

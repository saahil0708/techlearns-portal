import { Metadata } from 'next';
import SkillosAssessmentWorkspace from '@/components/students/skillos/SkillosAssessmentWorkspace';
import { apiService } from '@/lib/api-service';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `SkillOS Proctored Assessment: ${id} | TechLearns`,
    description: 'Secure, AI-monitored institutional coding evaluation with live proctoring HUD and compiler test runner.',
  };
}

export default async function SkillosAssessmentPage({ params }: PageProps) {
  const { id } = await params;

  let initialData: any = null;
  try {
    const contest = await apiService.getContestById(id);
    if (contest && contest.id) {
      initialData = contest;
    }
  } catch {
    // Fallback gracefully to default dummy assessment data
  }

  return <SkillosAssessmentWorkspace assessmentId={id} initialData={initialData} />;
}

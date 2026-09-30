import type { Metadata } from 'next';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import IdentityDiagnosticWizard from '@/components/students/diagnostic/IdentityDiagnosticWizard';
import { Box } from '@mui/material';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Identity & Diagnostic Baseline | CodePlatform',
  description: 'Calibrate your engineering goals, benchmark current knowledge levels, and receive tailored course & practice recommendations.',
};

export default function StudentDiagnosticPage() {
  return (
    <StudentAppLayout>
      <Box sx={{ maxWidth: 1100, mx: 'auto', width: '100%', py: 2 }}>
        <IdentityDiagnosticWizard isModal={false} />
      </Box>
    </StudentAppLayout>
  );
}

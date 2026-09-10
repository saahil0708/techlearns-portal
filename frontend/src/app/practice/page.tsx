import type { Metadata } from 'next';
import PracticeCompilerClient from '@/components/practice/PracticeCompilerClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Practice & Online Compilers | CodePlatform',
  description: 'Interactive multi-language compiler, algorithm practice scratchpad, and sandboxed code runner.',
};

/**
 * Dedicated Practice & Compilers Page (React Server Component)
 */
export default function PracticePage() {
  return <PracticeCompilerClient />;
}

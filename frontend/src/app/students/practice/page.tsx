import type { Metadata } from 'next';
import PracticeCompilerClient from '@/components/practice/PracticeCompilerClient';

export const metadata: Metadata = {
  title: 'Practice & Online Compilers | CodePlatform',
  description: 'Interactive multi-language compiler, algorithm practice scratchpad, and sandboxed code runner.',
};

/**
 * Dedicated Student Practice & Compilers Page (React Server Component)
 */
export default function StudentPracticePage() {
  return <PracticeCompilerClient />;
}

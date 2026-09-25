import type { Metadata } from 'next';
import BootcampsDirectoryClient from '@/components/superadmin/bootcamps/BootcampsDirectoryClient';
import { apiService } from '@/lib/api-service';

export const metadata: Metadata = {
  title: 'Bootcamp & Cohort Management | CodePlatform Admin',
  description: 'Manage live industry sprint bootcamps, masterclasses, and capstones.',
};

export const dynamic = 'force-dynamic';

export default async function SuperadminBootcampsPage() {
  let initialBootcamps: any[] = [];
  let initialError: string | null = null;

  try {
    let page = 1;
    let totalPages = 1;
    const allItems: any[] = [];

    do {
      const liveData = await apiService.getBootcamps({ page, limit: 100 });
      if (liveData?.items) {
        allItems.push(...liveData.items);
        totalPages = liveData.totalPages || 1;
      }
      page++;
    } while (page <= totalPages && page <= 10); // Safe cap for SSR

    initialBootcamps = allItems;
  } catch (err: any) {
    console.error('Failed to fetch initial bootcamps in RSC:', err);
    initialError = err?.message || 'Failed to load bootcamps from server';
  }

  return <BootcampsDirectoryClient initialBootcamps={initialBootcamps} initialError={initialError} />;
}

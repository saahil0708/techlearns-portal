import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CollegeDetailLegacyRedirectPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/superadmin/institutions/${id}`);
}

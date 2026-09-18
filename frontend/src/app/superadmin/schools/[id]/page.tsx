import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SchoolDetailPage({ params }: Props) {
  const { id } = await params;
  redirect(`/superadmin/institutions/${id}`);
}

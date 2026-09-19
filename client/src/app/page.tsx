import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { extractRole, getRoleDefaultPath } from '@/utils/role-routing';

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const role = extractRole(token);
  redirect(getRoleDefaultPath(role));
}
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminRedirectPage() {
  const session = await getServerSession(authOptions);
  
  // If not authenticated, redirect to login with callback to admin dashboard
  if (!session?.user) {
    redirect('/login?callbackUrl=/admin/dashboard');
  }

  const userRole = (session.user as any).role;
  
  // If user is admin, redirect to admin dashboard
  if (['ADMIN', 'PHARMACIST', 'STAFF'].includes(userRole)) {
    redirect('/admin/dashboard');
  }
  
  // If authenticated but not admin, redirect to home
  redirect('/');
}
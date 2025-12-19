import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProfileForm from './ProfileForm';

async function getUserProfile(userId: number) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true,
      orders: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: { medicine: true }
          }
        }
      },
      prescriptions: {
        take: 5,
        orderBy: { uploadedAt: 'desc' }
      }
    }
  });
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/profile');
  }

  const userProfile = await getUserProfile(parseInt(session.user.id as string));

  if (!userProfile) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account information and preferences
          </p>
        </div>

        <ProfileForm user={userProfile} />
      </div>
    </div>
  );
}
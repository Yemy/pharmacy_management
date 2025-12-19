import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import UserManagement from './UserManagement';

async function getUsers() {
  return await prisma.user.findMany({
    where: { deletedAt: null },
    include: {
      role: true,
      orders: {
        select: { id: true, total: true, status: true }
      },
      prescriptions: {
        select: { id: true, verified: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function getRoles() {
  return await prisma.role.findMany({
    orderBy: { name: 'asc' }
  });
}

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (!['ADMIN'].includes(userRole)) {
    redirect('/admin/dashboard');
  }

  const [users, roles] = await Promise.all([
    getUsers(),
    getRoles()
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage user accounts, roles, and permissions
        </p>
      </div>

      <Suspense fallback={<div>Loading users...</div>}>
        <UserManagement initialUsers={users} roles={roles} />
      </Suspense>
    </div>
  );
}
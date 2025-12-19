"use client";

import { useState } from 'react';
import { User, Role, Order, Prescription } from '@prisma/client';
import { updateUserRole, toggleUserStatus } from '@/actions/user';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Users, 
  Eye, 
  UserCheck, 
  UserX, 
  Shield,
  Package,
  FileText,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';

type UserWithDetails = User & {
  role: Role | null;
  orders: Pick<Order, 'id' | 'total' | 'status'>[];
  prescriptions: Pick<Prescription, 'id' | 'verified'>[];
};

interface UserManagementProps {
  initialUsers: UserWithDetails[];
  roles: Role[];
}

export default function UserManagement({ initialUsers, roles }: UserManagementProps) {
  const [users, setUsers] = useState<UserWithDetails[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const handleRoleUpdate = async (userId: number, roleId: number) => {
    setIsUpdating(userId);
    
    try {
      const result = await updateUserRole(userId, roleId);
      
      if (result.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, roleId, role: roles.find(r => r.id === roleId) || null }
            : user
        ));
        toast.success('User role updated successfully');
      } else {
        toast.error(result.error || 'Failed to update user role');
      }
    } catch (error) {
      toast.error('Failed to update user role');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    setIsUpdating(userId);
    
    try {
      const result = await toggleUserStatus(userId, !currentStatus);
      
      if (result.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, isVerified: !currentStatus }
            : user
        ));
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(result.error || 'Failed to update user status');
      }
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setIsUpdating(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTotalSpent = (orders: Pick<Order, 'total'>[]) => {
    return orders.reduce((sum, order) => sum + order.total, 0);
  };

  const getVerifiedPrescriptions = (prescriptions: Pick<Prescription, 'verified'>[]) => {
    return prescriptions.filter(p => p.verified).length;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <UserCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.isVerified).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.role?.name !== 'CUSTOMER').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Staff Members</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.reduce((sum, u) => sum + u.orders.length, 0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={user.roleId?.toString() || ''}
                    onValueChange={(value) => handleRoleUpdate(user.id, parseInt(value))}
                    disabled={isUpdating === user.id}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={user.isVerified 
                      ? 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' 
                      : 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                    }
                  >
                    {user.isVerified ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-gray-900 dark:text-white">{user.orders.length}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(getTotalSpent(user.orders))}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>User Details - {selectedUser?.name || selectedUser?.email}</DialogTitle>
                        </DialogHeader>
                        {selectedUser && (
                          <div className="space-y-6">
                            {/* User Information */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Personal Information</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {selectedUser.email}
                                    </span>
                                  </div>
                                  {selectedUser.phone && (
                                    <div className="flex items-center space-x-2">
                                      <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {selectedUser.phone}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-2">
                                    <Shield className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    <Badge variant="outline">
                                      {selectedUser.role?.name || 'No Role'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Account Statistics</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Orders:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {selectedUser.orders.length}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Spent:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {formatCurrency(getTotalSpent(selectedUser.orders))}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Prescriptions:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {selectedUser.prescriptions.length}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Verified:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {getVerifiedPrescriptions(selectedUser.prescriptions)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Recent Orders */}
                            {selectedUser.orders.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Recent Orders</h4>
                                <div className="space-y-2">
                                  {selectedUser.orders.slice(0, 5).map((order) => (
                                    <div key={order.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                      <span className="text-sm text-gray-900 dark:text-white">
                                        Order #{order.id}
                                      </span>
                                      <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="text-xs">
                                          {order.status}
                                        </Badge>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                          {formatCurrency(order.total)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusToggle(user.id, user.isVerified)}
                      disabled={isUpdating === user.id}
                      className={user.isVerified 
                        ? 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300' 
                        : 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
                      }
                    >
                      {user.isVerified ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
          <p className="text-gray-500 dark:text-gray-400">Users will appear here when they register.</p>
        </div>
      )}
    </div>
  );
}
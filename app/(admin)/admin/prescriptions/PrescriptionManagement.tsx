"use client";

import { useState } from 'react';
import { Prescription, User, Order, OrderItem, Medicine } from '@prisma/client';
import { verifyPrescription } from '@/actions/prescription';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  FileText, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  User as UserIcon,
  Download,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

type PrescriptionWithDetails = Prescription & {
  user: Pick<User, 'id' | 'name' | 'email' | 'phone'>;
  order: (Order & {
    items: (OrderItem & { medicine: Medicine })[];
  }) | null;
};

interface PrescriptionManagementProps {
  initialPrescriptions: PrescriptionWithDetails[];
}

export default function PrescriptionManagement({ initialPrescriptions }: PrescriptionManagementProps) {
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithDetails[]>(initialPrescriptions);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionWithDetails | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');

  const handleVerification = async (id: number, verified: boolean) => {
    setIsUpdating(id);
    
    try {
      const result = await verifyPrescription(id, verified);
      
      if (result.success) {
        setPrescriptions(prev => prev.map(prescription => 
          prescription.id === id 
            ? { ...prescription, verified }
            : prescription
        ));
        toast.success(`Prescription ${verified ? 'verified' : 'rejected'} successfully`);
      } else {
        toast.error(result.error || 'Failed to update prescription status');
      }
    } catch (error) {
      toast.error('Failed to update prescription status');
    } finally {
      setIsUpdating(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getFileIcon = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    return extension === 'pdf' ? '📄' : '🖼️';
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (filter === 'pending') return !prescription.verified;
    if (filter === 'verified') return prescription.verified;
    return true;
  });

  const pendingCount = prescriptions.filter(p => !p.verified).length;
  const verifiedCount = prescriptions.filter(p => p.verified).length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{prescriptions.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Prescriptions</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{verifiedCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          All Prescriptions ({prescriptions.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('verified')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'verified'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Verified ({verifiedCount})
        </button>
      </div>

      {/* Prescriptions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prescription</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Associated Order</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrescriptions.map((prescription) => (
              <TableRow key={prescription.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                      <span className="text-lg">{getFileIcon(prescription.filePath)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Prescription #{prescription.id}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {prescription.filePath.split('/').pop()}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {prescription.user.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {prescription.user.email}
                    </div>
                    {prescription.user.phone && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {prescription.user.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(prescription.uploadedAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={prescription.verified 
                      ? 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' 
                      : 'text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                    }
                  >
                    {prescription.verified ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  {prescription.order ? (
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Order #{prescription.order.id}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {prescription.order.items.length} items • {formatCurrency(prescription.order.total)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">No order</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPrescription(prescription)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Prescription Details - #{selectedPrescription?.id}</DialogTitle>
                        </DialogHeader>
                        {selectedPrescription && (
                          <div className="space-y-6">
                            {/* Customer Information */}
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Customer Information</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <UserIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {selectedPrescription.user.name || 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {selectedPrescription.user.email}
                                    </span>
                                  </div>
                                  {selectedPrescription.user.phone && (
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {selectedPrescription.user.phone}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Prescription Information</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Upload Date:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {formatDate(selectedPrescription.uploadedAt)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                                    <Badge 
                                      variant="outline" 
                                      className={selectedPrescription.verified 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-yellow-600 dark:text-yellow-400'
                                      }
                                    >
                                      {selectedPrescription.verified ? 'Verified' : 'Pending'}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">File Type:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {selectedPrescription.filePath.split('.').pop()?.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Associated Order */}
                            {selectedPrescription.order && (
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Associated Order</h4>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <div className="font-medium text-gray-900 dark:text-white">
                                        Order #{selectedPrescription.order.id}
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {selectedPrescription.order.items.length} items
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(selectedPrescription.order.total)}
                                      </div>
                                      <Badge variant="outline">
                                        {selectedPrescription.order.status}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    {selectedPrescription.order.items.map((item) => (
                                      <div key={item.id} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-900 dark:text-white">
                                          {item.medicine.name} x{item.quantity}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                          {formatCurrency(item.price * item.quantity)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Prescription File Preview */}
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Prescription File</h4>
                              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{getFileIcon(selectedPrescription.filePath)}</span>
                                    <div>
                                      <div className="font-medium text-gray-900 dark:text-white">
                                        {selectedPrescription.filePath.split('/').pop()}
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Click to view or download
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(selectedPrescription.filePath, '_blank')}
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      View
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = selectedPrescription.filePath;
                                        link.download = `prescription-${selectedPrescription.id}`;
                                        link.click();
                                      }}
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {!prescription.verified && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerification(prescription.id, true)}
                          disabled={isUpdating === prescription.id}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerification(prescription.id, false)}
                          disabled={isUpdating === prescription.id}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredPrescriptions.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {filter === 'pending' ? 'No pending prescriptions' : 
             filter === 'verified' ? 'No verified prescriptions' : 
             'No prescriptions found'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'pending' ? 'All prescriptions have been reviewed.' :
             filter === 'verified' ? 'No prescriptions have been verified yet.' :
             'Prescriptions will appear here when customers upload them.'}
          </p>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from 'react';
import { Prescription, Order, OrderItem, Medicine } from '@prisma/client';
import { uploadPrescription, deletePrescription } from '@/actions/prescription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  FileText, 
  Upload, 
  Eye, 
  Trash2, 
  CheckCircle, 
  Clock,
  Plus,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

type PrescriptionWithOrder = Prescription & {
  order: (Order & {
    items: (OrderItem & { medicine: Medicine })[];
  }) | null;
};

interface PrescriptionManagerProps {
  initialPrescriptions: PrescriptionWithOrder[];
}

export default function PrescriptionManager({ initialPrescriptions }: PrescriptionManagerProps) {
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithOrder[]>(initialPrescriptions);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image (JPG, PNG) or PDF file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const result = await uploadPrescription(formData);
      
      if (result.success && result.data) {
        setPrescriptions(prev => [{ ...result.data, order: null } as any, ...prev]);
        toast.success('Prescription uploaded successfully');
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
      } else {
        toast.error(result.error || 'Failed to upload prescription');
      }
    } catch (error) {
      toast.error('Failed to upload prescription');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this prescription?')) return;

    try {
      const result = await deletePrescription(id);
      if (result.success) {
        setPrescriptions(prev => prev.filter(p => p.id !== id));
        toast.success('Prescription deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete prescription');
      }
    } catch (error) {
      toast.error('Failed to delete prescription');
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

  const getFileIcon = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    return extension === 'pdf' ? '📄' : '🖼️';
  };

  return (
    <div className="space-y-6">
      {/* Upload Button */}
      <div className="flex justify-end">
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Upload Prescription</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Prescription</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="prescription-file">Select File</Label>
                <Input
                  id="prescription-file"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Supported formats: JPG, PNG, PDF (max 5MB)
                </p>
              </div>
              
              {selectedFile && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getFileIcon(selectedFile.name)}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsUploadDialogOpen(false);
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Prescriptions List */}
      {prescriptions.length > 0 ? (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Prescription #{prescription.id}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Uploaded on {formatDate(prescription.uploadedAt)}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
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
                            Pending Verification
                          </>
                        )}
                      </Badge>
                      <span className="text-lg">{getFileIcon(prescription.filePath)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(prescription.filePath, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = prescription.filePath;
                      link.download = `prescription-${prescription.id}`;
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(prescription.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Associated Order */}
              {prescription.order && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Associated Order</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Order #{prescription.order.id}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {prescription.order.items.length} items • ${prescription.order.total.toFixed(2)}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {prescription.order.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No prescriptions yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upload your medical prescriptions to order prescription medicines
          </p>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Prescription
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      )}
    </div>
  );
}
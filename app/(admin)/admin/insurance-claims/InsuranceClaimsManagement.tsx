"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus,
  Search,
  Shield,
  CheckCircle,
  Clock,
  X,
  Eye,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface InsuranceClaimsData {
  claims: any[];
  providers: any[];
  sales: any[];
}

interface InsuranceClaimsManagementProps {
  data: InsuranceClaimsData;
  currentUser: any;
}

export default function InsuranceClaimsManagement({ data }: InsuranceClaimsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [newClaim, setNewClaim] = useState({
    saleId: '',
    providerId: '',
    patientId: '',
    prescriptionNumber: '',
    copay: 0,
    deductible: 0
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'PARTIAL': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredClaims = data.claims.filter(claim => {
    const matchesSearch = claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const createClaim = async () => {
    if (!newClaim.saleId || !newClaim.providerId || !newClaim.patientId) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const sale = data.sales.find(s => s.id === parseInt(newClaim.saleId));
      if (!sale) {
        toast.error('Sale not found');
        return;
      }

      const response = await fetch('/api/insurance-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saleId: parseInt(newClaim.saleId),
          providerId: parseInt(newClaim.providerId),
          patientId: newClaim.patientId,
          prescriptionNumber: newClaim.prescriptionNumber || null,
          claimAmount: sale.total,
          copay: newClaim.copay,
          deductible: newClaim.deductible
        })
      });

      if (response.ok) {
        toast.success('Insurance claim created successfully');
        setShowCreateDialog(false);
        setNewClaim({
          saleId: '',
          providerId: '',
          patientId: '',
          prescriptionNumber: '',
          copay: 0,
          deductible: 0
        });
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create claim');
      }
    } catch (error) {
      toast.error('Failed to create claim');
    }
  };

  const updateClaimStatus = async (claimId: number, status: string, approvedAmount?: number) => {
    try {
      const response = await fetch(`/api/insurance-claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, approvedAmount })
      });

      if (response.ok) {
        toast.success('Claim status updated');
        window.location.reload();
      } else {
        toast.error('Failed to update claim status');
      }
    } catch (error) {
      toast.error('Failed to update claim status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <Input
              placeholder="Search claims..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="PARTIAL">Partial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Insurance Claim</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sale</Label>
                  <Select value={newClaim.saleId} onValueChange={(value) => setNewClaim(prev => ({ ...prev, saleId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sale" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.sales.map(sale => (
                        <SelectItem key={sale.id} value={sale.id.toString()}>
                          Sale #{sale.saleNumber} - {formatCurrency(sale.total)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Insurance Provider</Label>
                  <Select value={newClaim.providerId} onValueChange={(value) => setNewClaim(prev => ({ ...prev, providerId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.providers.map(provider => (
                        <SelectItem key={provider.id} value={provider.id.toString()}>
                          {provider.name} ({provider.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patient ID</Label>
                  <Input
                    value={newClaim.patientId}
                    onChange={(e) => setNewClaim(prev => ({ ...prev, patientId: e.target.value }))}
                    placeholder="Insurance member ID"
                  />
                </div>
                <div>
                  <Label>Prescription Number (Optional)</Label>
                  <Input
                    value={newClaim.prescriptionNumber}
                    onChange={(e) => setNewClaim(prev => ({ ...prev, prescriptionNumber: e.target.value }))}
                    placeholder="Prescription number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Copay</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newClaim.copay}
                    onChange={(e) => setNewClaim(prev => ({ ...prev, copay: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Deductible</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newClaim.deductible}
                    onChange={(e) => setNewClaim(prev => ({ ...prev, deductible: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createClaim}>
                  Create Claim
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Claims Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim Number</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Patient ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Claim Amount</TableHead>
                <TableHead>Approved Amount</TableHead>
                <TableHead>Submitted Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">{claim.claimNumber}</TableCell>
                  <TableCell>{claim.provider.name}</TableCell>
                  <TableCell>{claim.patientId}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(claim.status)}>
                      {claim.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(claim.claimAmount)}</TableCell>
                  <TableCell>
                    {claim.approvedAmount ? formatCurrency(claim.approvedAmount) : '-'}
                  </TableCell>
                  <TableCell>{formatDate(claim.submittedAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedClaim(claim);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {claim.status === 'PENDING' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateClaimStatus(claim.id, 'APPROVED', claim.claimAmount)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateClaimStatus(claim.id, 'REJECTED')}
                          >
                            <X className="w-4 h-4" />
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
      </div>

      {/* Claim Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Claim Number</Label>
                  <div className="font-medium">{selectedClaim.claimNumber}</div>
                </div>
                <div>
                  <Label>Provider</Label>
                  <div className="font-medium">{selectedClaim.provider.name}</div>
                </div>
                <div>
                  <Label>Patient ID</Label>
                  <div className="font-medium">{selectedClaim.patientId}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedClaim.status)}>
                    {selectedClaim.status}
                  </Badge>
                </div>
                <div>
                  <Label>Claim Amount</Label>
                  <div className="font-medium">{formatCurrency(selectedClaim.claimAmount)}</div>
                </div>
                <div>
                  <Label>Approved Amount</Label>
                  <div className="font-medium">
                    {selectedClaim.approvedAmount ? formatCurrency(selectedClaim.approvedAmount) : 'Not set'}
                  </div>
                </div>
                <div>
                  <Label>Copay</Label>
                  <div className="font-medium">{formatCurrency(selectedClaim.copay)}</div>
                </div>
                <div>
                  <Label>Deductible</Label>
                  <div className="font-medium">{formatCurrency(selectedClaim.deductible)}</div>
                </div>
              </div>

              {selectedClaim.sale && (
                <div>
                  <Label>Sale Information</Label>
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm">
                      <div><strong>Sale Number:</strong> {selectedClaim.sale.saleNumber}</div>
                      <div><strong>Customer:</strong> {selectedClaim.sale.customer ? 
                        `${selectedClaim.sale.customer.firstName} ${selectedClaim.sale.customer.lastName}` : 
                        'Walk-in Customer'
                      }</div>
                      <div><strong>Total:</strong> {formatCurrency(selectedClaim.sale.total)}</div>
                      <div><strong>Date:</strong> {formatDate(selectedClaim.sale.createdAt)}</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedClaim.notes && (
                <div>
                  <Label>Notes</Label>
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {selectedClaim.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Claims</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {data.claims.filter(c => c.status === 'PENDING').length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Approved Claims</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {data.claims.filter(c => c.status === 'APPROVED').length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Claims</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {data.claims.length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Available Sales</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {data.sales.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
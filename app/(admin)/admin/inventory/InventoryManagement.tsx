"use client";

import { useState } from 'react';
import { Inventory, Medicine, Supplier, Category } from '@prisma/client';
import { addInventory, updateInventory, deleteInventory } from '@/actions/inventory';
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
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';

type InventoryWithDetails = Inventory & {
  medicine: Medicine & { category: Category | null };
  supplier: Supplier | null;
};

type MedicineWithCategory = Medicine & { category: Category | null };

interface InventoryManagementProps {
  initialInventory: InventoryWithDetails[];
  medicines: MedicineWithCategory[];
  suppliers: Supplier[];
}

export default function InventoryManagement({ 
  initialInventory, 
  medicines, 
  suppliers 
}: InventoryManagementProps) {
  const [inventory, setInventory] = useState<InventoryWithDetails[]>(initialInventory);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    medicineId: '',
    supplierId: '',
    batchNumber: '',
    quantity: '',
    unitPrice: '',
    expiryDate: '',
  });

  const resetForm = () => {
    setFormData({
      medicineId: '',
      supplierId: '',
      batchNumber: '',
      quantity: '',
      unitPrice: '',
      expiryDate: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const inventoryData = {
        medicineId: parseInt(formData.medicineId),
        supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
        batchNumber: formData.batchNumber || undefined,
        quantity: parseInt(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
      };

      let result;
      if (editingItem) {
        result = await updateInventory(editingItem.id, inventoryData);
      } else {
        result = await addInventory(inventoryData);
      }

      if (result.success) {
        if (editingItem) {
          setInventory(prev => prev.map(item => 
            item.id === editingItem.id 
              ? { ...result.data, medicine: item.medicine, supplier: item.supplier } as any
              : item
          ));
          toast.success('Inventory updated successfully');
          setEditingItem(null);
        } else {
          // Refresh the page to get the full item with relations
          window.location.reload();
        }
        resetForm();
        setIsAddDialogOpen(false);
      } else {
        toast.error(result.error || 'Failed to save inventory');
      }
    } catch (error) {
      toast.error('Failed to save inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;

    try {
      const result = await deleteInventory(id);
      if (result.success) {
        setInventory(prev => prev.filter(item => item.id !== id));
        toast.success('Inventory item deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete inventory item');
      }
    } catch (error) {
      toast.error('Failed to delete inventory item');
    }
  };

  const handleEdit = (item: InventoryWithDetails) => {
    setEditingItem(item);
    setFormData({
      medicineId: item.medicineId.toString(),
      supplierId: item.supplierId?.toString() || '',
      batchNumber: item.batchNumber || '',
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
    });
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

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate: Date | null) => {
    if (!expiryDate) return null;
    
    const daysLeft = getDaysUntilExpiry(expiryDate);
    
    if (daysLeft < 0) {
      return { status: 'expired', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', label: 'Expired' };
    } else if (daysLeft <= 7) {
      return { status: 'urgent', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', label: 'Urgent' };
    } else if (daysLeft <= 30) {
      return { status: 'warning', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', label: 'Warning' };
    }
    
    return { status: 'good', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', label: 'Good' };
  };

  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const lowStockItems = inventory.filter(item => item.quantity <= 10).length;
  const expiringItems = inventory.filter(item => {
    if (!item.expiryDate) return false;
    const daysLeft = getDaysUntilExpiry(item.expiryDate);
    return daysLeft <= 30 && daysLeft >= 0;
  }).length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{inventory.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalValue)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <TrendingDown className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{lowStockItems}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{expiringItems}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expiring Soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Inventory Button */}
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Stock
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Stock</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="medicineId">Medicine *</Label>
                  <Select
                    value={formData.medicineId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, medicineId: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select medicine" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicines.map((medicine) => (
                        <SelectItem key={medicine.id} value={medicine.id.toString()}>
                          {medicine.name} - {medicine.category?.name || 'No Category'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supplierId">Supplier</Label>
                  <Select
                    value={formData.supplierId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    required
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="unitPrice">Unit Price *</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="batchNumber">Batch Number</Label>
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Stock'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => {
              const expiryStatus = getExpiryStatus(item.expiryDate);
              const isLowStock = item.quantity <= 10;
              
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.medicine.name}
                      </div>
                      {item.medicine.category && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {item.medicine.category.name}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900 dark:text-white">
                      {item.batchNumber || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                        {item.quantity}
                      </span>
                      {isLowStock && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(item.unitPrice)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.expiryDate ? (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span className="text-gray-900 dark:text-white">
                            {formatDate(item.expiryDate)}
                          </span>
                        </div>
                        {expiryStatus && (
                          <Badge variant="outline" className={expiryStatus.color}>
                            {expiryStatus.label}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">No expiry</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900 dark:text-white">
                      {item.supplier?.name || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Stock Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-medicineId">Medicine *</Label>
                <Select
                  value={formData.medicineId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, medicineId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select medicine" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicines.map((medicine) => (
                      <SelectItem key={medicine.id} value={medicine.id.toString()}>
                        {medicine.name} - {medicine.category?.name || 'No Category'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-supplierId">Supplier</Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-quantity">Quantity *</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  required
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="edit-unitPrice">Unit Price *</Label>
                <Input
                  id="edit-unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-batchNumber">Batch Number</Label>
                <Input
                  id="edit-batchNumber"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-expiryDate">Expiry Date</Label>
                <Input
                  id="edit-expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingItem(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Stock'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {inventory.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No inventory items</h3>
          <p className="text-gray-500 dark:text-gray-400">Add stock items to start managing your inventory.</p>
        </div>
      )}
    </div>
  );
}
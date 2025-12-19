"use client";

import { useState, useEffect } from 'react';
import { Medicine, Category, Inventory } from '@prisma/client';
import { createMedicine, updateMedicine, deleteMedicine, getExpiringMedicines, getLowStockMedicines } from '@/actions/medicine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Package, 
  Calendar,
  TrendingDown,
  Pill
} from 'lucide-react';
import { toast } from 'sonner';

type MedicineWithDetails = Medicine & {
  category: Category | null;
  inventories: Inventory[];
};

type ExpiringInventory = Inventory & {
  medicine: Medicine & { category: Category | null };
};

interface MedicineManagementProps {
  initialMedicines: MedicineWithDetails[];
  categories: Category[];
}

export default function MedicineManagement({ initialMedicines, categories }: MedicineManagementProps) {
  const [medicines, setMedicines] = useState<MedicineWithDetails[]>(initialMedicines);
  const [expiringMedicines, setExpiringMedicines] = useState<ExpiringInventory[]>([]);
  const [lowStockMedicines, setLowStockMedicines] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'medicines' | 'expiring' | 'lowstock'>('medicines');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    usage: '',
    dosage: '',
    sideEffects: '',
    sku: '',
    barcode: '',
    unit: '',
    price: '',
    minStock: '10',
    categoryId: '',
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const [expiringResult, lowStockResult] = await Promise.all([
        getExpiringMedicines(30),
        getLowStockMedicines(),
      ]);

      if (expiringResult.success) {
        setExpiringMedicines(expiringResult.data || []);
      }

      if (lowStockResult.success) {
        setLowStockMedicines(lowStockResult.data || []);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      usage: '',
      dosage: '',
      sideEffects: '',
      sku: '',
      barcode: '',
      unit: '',
      price: '',
      minStock: '10',
      categoryId: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const medicineData = {
        ...formData,
        price: parseFloat(formData.price),
        minStock: parseInt(formData.minStock),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
      };

      let result;
      if (editingMedicine) {
        result = await updateMedicine(editingMedicine.id, medicineData);
      } else {
        result = await createMedicine(medicineData);
      }

      if (result.success) {
        if (editingMedicine) {
          setMedicines(prev => prev.map(med => 
            med.id === editingMedicine.id 
              ? { ...result.data, inventories: med.inventories } as any
              : med
          ));
          toast.success('Medicine updated successfully');
          setEditingMedicine(null);
        } else {
          setMedicines(prev => [...prev, { ...result.data, inventories: [] } as any]);
          toast.success('Medicine created successfully');
          setIsAddDialogOpen(false);
        }
        resetForm();
      } else {
        toast.error(result.error || 'Failed to save medicine');
      }
    } catch (error) {
      toast.error('Failed to save medicine');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;

    try {
      const result = await deleteMedicine(id);
      if (result.success) {
        setMedicines(prev => prev.filter(med => med.id !== id));
        toast.success('Medicine deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete medicine');
      }
    } catch (error) {
      toast.error('Failed to delete medicine');
    }
  };

  const handleEdit = (medicine: MedicineWithDetails) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      description: medicine.description || '',
      usage: medicine.usage || '',
      dosage: medicine.dosage || '',
      sideEffects: medicine.sideEffects || '',
      sku: medicine.sku || '',
      barcode: medicine.barcode || '',
      unit: medicine.unit || '',
      price: medicine.price.toString(),
      minStock: medicine.minStock.toString(),
      categoryId: medicine.categoryId?.toString() || '',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTotalStock = (inventories: Inventory[]) => {
    return inventories.reduce((sum, inv) => sum + inv.quantity, 0);
  };

  return (
    <div className="space-y-6">
      {/* Notification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="font-medium text-red-900 dark:text-red-100">Expiring Soon</h3>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
            {expiringMedicines.length}
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">medicines expiring in 30 days</p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-medium text-yellow-900 dark:text-yellow-100">Low Stock</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
            {lowStockMedicines.length}
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">medicines below minimum stock</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Total Medicines</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {medicines.length}
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">active medicines in catalog</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('medicines')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'medicines'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          All Medicines
        </button>
        <button
          onClick={() => setActiveTab('expiring')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'expiring'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Expiring Soon ({expiringMedicines.length})
        </button>
        <button
          onClick={() => setActiveTab('lowstock')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'lowstock'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Low Stock ({lowStockMedicines.length})
        </button>
      </div>

      {/* Add Medicine Button */}
      {activeTab === 'medicines' && (
        <div className="flex justify-end">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Medicine</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Medicine Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoryId">Category</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="usage">Usage/Indication</Label>
                  <Textarea
                    id="usage"
                    value={formData.usage}
                    onChange={(e) => setFormData(prev => ({ ...prev, usage: e.target.value }))}
                    placeholder="What is this medicine used for?"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="dosage">Dosage Instructions</Label>
                  <Textarea
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                    placeholder="How should this medicine be taken?"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="sideEffects">Side Effects</Label>
                  <Textarea
                    id="sideEffects"
                    value={formData.sideEffects}
                    onChange={(e) => setFormData(prev => ({ ...prev, sideEffects: e.target.value }))}
                    placeholder="Possible side effects"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="minStock">Minimum Stock *</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="e.g., tablet, ml"
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
                    {isLoading ? 'Adding...' : 'Add Medicine'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'medicines' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicines.map((medicine) => {
                const totalStock = getTotalStock(medicine.inventories);
                const isLowStock = totalStock <= medicine.minStock;
                
                return (
                  <TableRow key={medicine.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{medicine.name}</div>
                        {medicine.usage && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {medicine.usage}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {medicine.category ? (
                        <Badge variant="outline">{medicine.category.name}</Badge>
                      ) : (
                        <span className="text-gray-400">No category</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(medicine.price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className={isLowStock ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                          {totalStock}
                        </span>
                        {isLowStock && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                    </TableCell>
                    <TableCell>{medicine.minStock}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(medicine)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(medicine.id)}
                          className="text-red-600 hover:text-red-700"
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
      )}

      {activeTab === 'expiring' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiringMedicines.map((inventory) => {
                const daysLeft = getDaysUntilExpiry(inventory.expiryDate!);
                const isUrgent = daysLeft <= 7;
                
                return (
                  <TableRow key={inventory.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{inventory.medicine.name}</div>
                        {inventory.medicine.category && (
                          <Badge variant="outline" className="mt-1">
                            {inventory.medicine.category.name}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{inventory.batchNumber || 'N/A'}</TableCell>
                    <TableCell>{inventory.quantity}</TableCell>
                    <TableCell>{formatDate(inventory.expiryDate!)}</TableCell>
                    <TableCell>
                      <span className={isUrgent ? 'text-red-600 dark:text-red-400 font-medium' : 'text-yellow-600 dark:text-yellow-400'}>
                        {daysLeft} days
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={isUrgent ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}>
                        {isUrgent ? 'Urgent' : 'Warning'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {expiringMedicines.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No expiring medicines</h3>
              <p className="text-gray-500 dark:text-gray-400">All medicines are within safe expiry dates.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'lowstock' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Minimum Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockMedicines.map((medicine) => (
                <TableRow key={medicine.id}>
                  <TableCell>
                    <div className="font-medium">{medicine.name}</div>
                  </TableCell>
                  <TableCell>
                    {medicine.category ? (
                      <Badge variant="outline">{medicine.category.name}</Badge>
                    ) : (
                      <span className="text-gray-400">No category</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {medicine.currentStock}
                    </span>
                  </TableCell>
                  <TableCell>{medicine.minStock}</TableCell>
                  <TableCell>
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Low Stock
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {lowStockMedicines.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">All medicines well stocked</h3>
              <p className="text-gray-500 dark:text-gray-400">No medicines are below minimum stock levels.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Medicine Dialog */}
      <Dialog open={!!editingMedicine} onOpenChange={(open) => !open && setEditingMedicine(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Medicine</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Medicine Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-categoryId">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="edit-usage">Usage/Indication</Label>
              <Textarea
                id="edit-usage"
                value={formData.usage}
                onChange={(e) => setFormData(prev => ({ ...prev, usage: e.target.value }))}
                placeholder="What is this medicine used for?"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="edit-dosage">Dosage Instructions</Label>
              <Textarea
                id="edit-dosage"
                value={formData.dosage}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="How should this medicine be taken?"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="edit-sideEffects">Side Effects</Label>
              <Textarea
                id="edit-sideEffects"
                value={formData.sideEffects}
                onChange={(e) => setFormData(prev => ({ ...prev, sideEffects: e.target.value }))}
                placeholder="Possible side effects"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Price *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-minStock">Minimum Stock *</Label>
                <Input
                  id="edit-minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-barcode">Barcode</Label>
                <Input
                  id="edit-barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-unit">Unit</Label>
                <Input
                  id="edit-unit"
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="e.g., tablet, ml"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingMedicine(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Medicine'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
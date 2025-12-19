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
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  CreditCard,
  DollarSign,
  Receipt,
  User,
  Calculator,
  Percent,
  CheckCircle,
  Scan
} from 'lucide-react';
import { toast } from 'sonner';
import { BarcodeScannerTrigger } from '@/components/BarcodeScanner';
import { useReceiptPrinter } from '@/components/ReceiptPrinter';

interface Medicine {
  id: number;
  name: string;
  price: number;
  availableStock: number;
  category: { name: string } | null;
  unit: string | null;
  barcode: string | null;
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  loyaltyPoints: number;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  user: { name: string | null };
}

interface CartItem {
  medicine: Medicine;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface POSSystemProps {
  medicines: Medicine[];
  customers: Customer[];
  employees: Employee[];
  currentUser: any;
}

export default function POSSystem({ medicines, customers, employees, currentUser }: POSSystemProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'INSURANCE'>('CASH');
  const [paymentRef, setPaymentRef] = useState('');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(8.5); // Default tax rate
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });

  const { printReceipt, ReceiptPrinterComponent } = useReceiptPrinter();

  // Filter medicines based on search
  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medicine.barcode && medicine.barcode.includes(searchTerm))
  );

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * tax) / 100;
  const total = taxableAmount + taxAmount;

  const addToCart = (medicine: Medicine) => {
    const existingItem = cart.find(item => item.medicine.id === medicine.id);
    
    if (existingItem) {
      if (existingItem.quantity >= medicine.availableStock) {
        toast.error(`Only ${medicine.availableStock} units available`);
        return;
      }
      updateQuantity(medicine.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        medicine,
        quantity: 1,
        unitPrice: medicine.price,
        discount: 0,
        total: medicine.price
      };
      setCart(prev => [...prev, newItem]);
    }
  };

  const updateQuantity = (medicineId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }

    setCart(prev => prev.map(item => {
      if (item.medicine.id === medicineId) {
        const quantity = Math.min(newQuantity, item.medicine.availableStock);
        const total = (item.unitPrice * quantity) - ((item.unitPrice * quantity * item.discount) / 100);
        return { ...item, quantity, total };
      }
      return item;
    }));
  };

  const updateItemDiscount = (medicineId: number, discount: number) => {
    setCart(prev => prev.map(item => {
      if (item.medicine.id === medicineId) {
        const total = (item.unitPrice * item.quantity) - ((item.unitPrice * item.quantity * discount) / 100);
        return { ...item, discount, total };
      }
      return item;
    }));
  };

  const removeFromCart = (medicineId: number) => {
    setCart(prev => prev.filter(item => item.medicine.id !== medicineId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setDiscount(0);
    setPaymentRef('');
  };

  const createCustomer = async () => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer)
      });

      if (response.ok) {
        const customer = await response.json();
        setSelectedCustomer(customer);
        setShowCustomerDialog(false);
        setNewCustomer({ firstName: '', lastName: '', phone: '', email: '' });
        toast.success('Customer created successfully');
      } else {
        toast.error('Failed to create customer');
      }
    } catch (error) {
      toast.error('Failed to create customer');
    }
  };

  const processSale = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (paymentMethod !== 'CASH' && !paymentRef) {
      toast.error('Payment reference is required');
      return;
    }

    setIsProcessing(true);

    try {
      const saleData = {
        customerId: selectedCustomer?.id,
        items: cart.map(item => ({
          medicineId: item.medicine.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          total: item.total
        })),
        subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total,
        paymentMethod,
        paymentRef: paymentRef || null,
        type: 'PHYSICAL'
      };

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });

      if (response.ok) {
        const sale = await response.json();
        toast.success(`Sale completed! Sale #${sale.saleNumber}`);
        // Print receipt
        handlePrintReceipt(sale);
        
        clearCart();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to process sale');
      }
    } catch (error) {
      toast.error('Failed to process sale');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = (sale: any) => {
    // Find current employee
    const currentEmployee = employees.find(emp => emp.user.name === currentUser.name);
    
    const receiptData = {
      saleNumber: sale.saleNumber,
      date: new Date(),
      customer: selectedCustomer ? {
        firstName: selectedCustomer.firstName,
        lastName: selectedCustomer.lastName,
        phone: selectedCustomer.phone || undefined
      } : undefined,
      employee: currentEmployee ? {
        firstName: currentEmployee.firstName,
        lastName: currentEmployee.lastName
      } : undefined,
      items: cart.map(item => ({
        medicine: {
          name: item.medicine.name,
          unit: item.medicine.unit || undefined
        },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: item.total
      })),
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      total,
      paymentMethod,
      paymentRef: paymentRef || undefined
    };

    printReceipt(receiptData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Product Search & Selection */}
      <div className="lg:col-span-2 space-y-6">
        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <Input
                placeholder="Search medicines by name, category, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <BarcodeScannerTrigger
              onScan={(barcode) => {
                // Find medicine by barcode
                const medicine = medicines.find(m => m.barcode === barcode);
                if (medicine) {
                  addToCart(medicine);
                  toast.success(`Added ${medicine.name} to cart`);
                } else {
                  // If not found by barcode, search by name
                  setSearchTerm(barcode);
                  toast.info(`Searching for: ${barcode}`);
                }
              }}
            >
              <Button variant="outline" size="default">
                <Scan className="w-4 h-4 mr-2" />
                Scan
              </Button>
            </BarcodeScannerTrigger>
          </div>
        </div>

        {/* Medicine Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Medicines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredMedicines.map((medicine) => (
              <div
                key={medicine.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => addToCart(medicine)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {medicine.name}
                    </h4>
                    {medicine.category && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {medicine.category.name}
                      </Badge>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        ${medicine.price.toFixed(2)}
                      </span>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Stock: {medicine.availableStock}
                        </div>
                        {medicine.unit && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            per {medicine.unit}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="space-y-6">
        {/* Customer Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer</h3>
            <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={newCustomer.firstName}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={newCustomer.lastName}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <Button onClick={createCustomer} className="w-full">
                    Create Customer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <Select onValueChange={(value) => {
            const customer = customers.find(c => c.id === parseInt(value));
            setSelectedCustomer(customer || null);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select customer (optional)" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id.toString()}>
                  {customer.firstName} {customer.lastName}
                  {customer.phone && ` - ${customer.phone}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedCustomer && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm">
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </div>
                {selectedCustomer.phone && (
                  <div className="text-blue-700 dark:text-blue-300">{selectedCustomer.phone}</div>
                )}
                <div className="text-blue-600 dark:text-blue-400">
                  Loyalty Points: {selectedCustomer.loyaltyPoints}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shopping Cart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cart ({cart.length} items)
            </h3>
            {cart.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearCart}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.medicine.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {item.medicine.name}
                    </h4>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ${item.unitPrice.toFixed(2)} each
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.medicine.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.medicine.id, item.quantity - 1)}
                      className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.medicine.id, item.quantity + 1)}
                      disabled={item.quantity >= item.medicine.availableStock}
                      className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      ${item.total.toFixed(2)}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Percent className="w-3 h-3 text-gray-400" />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount}
                        onChange={(e) => updateItemDiscount(item.medicine.id, parseFloat(e.target.value) || 0)}
                        className="w-12 h-6 text-xs p-1"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {cart.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Cart is empty</p>
            </div>
          )}
        </div>

        {/* Payment & Checkout */}
        {cart.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment</h3>
            
            {/* Payment Method */}
            <div className="space-y-4">
              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Cash
                      </div>
                    </SelectItem>
                    <SelectItem value="CARD">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Card
                      </div>
                    </SelectItem>
                    <SelectItem value="INSURANCE">
                      <div className="flex items-center">
                        <Receipt className="w-4 h-4 mr-2" />
                        Insurance
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod !== 'CASH' && (
                <div>
                  <Label>Payment Reference</Label>
                  <Input
                    placeholder={paymentMethod === 'CARD' ? 'Card transaction ID' : 'Insurance claim number'}
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                  />
                </div>
              )}

              {/* Discount */}
              <div>
                <Label>Overall Discount (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Tax Rate */}
              <div>
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Totals */}
            <div className="mt-6 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Discount ({discount}%):</span>
                  <span className="text-red-600 dark:text-red-400">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax ({tax}%):</span>
                <span className="text-gray-900 dark:text-white">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-700 pt-2">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-gray-900 dark:text-white">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Process Sale Button */}
            <Button
              onClick={processSale}
              disabled={isProcessing}
              className="w-full mt-6"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Calculator className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Sale - ${total.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      {/* Receipt Printer Component */}
      {ReceiptPrinterComponent}
    </div>
  );
}
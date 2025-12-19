"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Printer, Download, Mail, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReceiptData {
  saleNumber: string;
  date: Date;
  customer?: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  employee?: {
    firstName: string;
    lastName: string;
  };
  items: Array<{
    medicine: {
      name: string;
      unit?: string;
    };
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentRef?: string;
}

interface ReceiptPrinterProps {
  receiptData: ReceiptData;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiptPrinter({ receiptData, isOpen, onClose }: ReceiptPrinterProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const printReceipt = async () => {
    setIsPrinting(true);
    
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Unable to open print window');
      }

      // Generate receipt HTML
      const receiptHTML = generateReceiptHTML();
      
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };

      toast.success('Receipt sent to printer');
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print receipt');
    } finally {
      setIsPrinting(false);
    }
  };

  const downloadReceipt = () => {
    const receiptHTML = generateReceiptHTML();
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptData.saleNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Receipt downloaded');
  };

  const emailReceipt = async () => {
    if (!receiptData.customer?.phone) {
      toast.error('Customer contact information not available');
      return;
    }

    try {
      const response = await fetch('/api/receipts/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saleNumber: receiptData.saleNumber,
          customerEmail: receiptData.customer.phone, // In real app, this would be email
          receiptData
        })
      });

      if (response.ok) {
        toast.success('Receipt emailed to customer');
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      toast.error('Failed to email receipt');
    }
  };

  const generateReceiptHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${receiptData.saleNumber}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            max-width: 300px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .store-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .store-info {
            font-size: 10px;
            margin-bottom: 2px;
          }
          .receipt-info {
            margin-bottom: 15px;
          }
          .receipt-info div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
          }
          .items {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
            margin-bottom: 10px;
          }
          .item {
            margin-bottom: 8px;
          }
          .item-name {
            font-weight: bold;
            margin-bottom: 2px;
          }
          .item-details {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
          }
          .totals {
            margin-bottom: 15px;
          }
          .totals div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .total-line {
            border-top: 1px solid #000;
            padding-top: 5px;
            font-weight: bold;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            border-top: 2px solid #000;
            padding-top: 10px;
            margin-top: 15px;
            font-size: 10px;
          }
          @media print {
            body { margin: 0; padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="store-name">MediCare Pharmacy</div>
          <div class="store-info">123 Health Street, Medical City, MC 12345</div>
          <div class="store-info">Phone: (555) 123-4567</div>
          <div class="store-info">Email: info@medicare-pharmacy.com</div>
        </div>

        <div class="receipt-info">
          <div><span>Receipt #:</span><span>${receiptData.saleNumber}</span></div>
          <div><span>Date:</span><span>${formatDate(receiptData.date)}</span></div>
          ${receiptData.customer ? `
            <div><span>Customer:</span><span>${receiptData.customer.firstName} ${receiptData.customer.lastName}</span></div>
            ${receiptData.customer.phone ? `<div><span>Phone:</span><span>${receiptData.customer.phone}</span></div>` : ''}
          ` : ''}
          ${receiptData.employee ? `
            <div><span>Cashier:</span><span>${receiptData.employee.firstName} ${receiptData.employee.lastName}</span></div>
          ` : ''}
        </div>

        <div class="items">
          ${receiptData.items.map(item => `
            <div class="item">
              <div class="item-name">${item.medicine.name}</div>
              <div class="item-details">
                <span>${item.quantity} x ${formatCurrency(item.unitPrice)}${item.medicine.unit ? ` per ${item.medicine.unit}` : ''}</span>
                <span>${formatCurrency(item.total)}</span>
              </div>
              ${item.discount > 0 ? `
                <div class="item-details">
                  <span>Discount (${item.discount}%)</span>
                  <span>-${formatCurrency((item.unitPrice * item.quantity * item.discount) / 100)}</span>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <div class="totals">
          <div><span>Subtotal:</span><span>${formatCurrency(receiptData.subtotal)}</span></div>
          ${receiptData.discount > 0 ? `
            <div><span>Discount:</span><span>-${formatCurrency(receiptData.discount)}</span></div>
          ` : ''}
          <div><span>Tax:</span><span>${formatCurrency(receiptData.tax)}</span></div>
          <div class="total-line"><span>TOTAL:</span><span>${formatCurrency(receiptData.total)}</span></div>
        </div>

        <div class="receipt-info">
          <div><span>Payment:</span><span>${receiptData.paymentMethod}</span></div>
          ${receiptData.paymentRef ? `
            <div><span>Reference:</span><span>${receiptData.paymentRef}</span></div>
          ` : ''}
        </div>

        <div class="footer">
          <div>Thank you for your business!</div>
          <div>Please keep this receipt for your records</div>
          <div>Return policy: 30 days with receipt</div>
          <div style="margin-top: 10px;">
            Visit us online: www.medicare-pharmacy.com
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Printer className="w-5 h-5" />
            <span>Receipt Options</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Receipt Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="text-center border-b pb-2 mb-3">
              <div className="font-bold">MediCare Pharmacy</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Receipt #{receiptData.saleNumber}</div>
            </div>
            
            <div className="space-y-1 text-sm">
              {receiptData.items.slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="truncate mr-2">{item.medicine.name}</span>
                  <span>{formatCurrency(item.total)}</span>
                </div>
              ))}
              {receiptData.items.length > 3 && (
                <div className="text-center text-gray-500 text-xs">
                  ... and {receiptData.items.length - 3} more items
                </div>
              )}
              
              <div className="border-t pt-2 mt-2 font-semibold flex justify-between">
                <span>Total:</span>
                <span>{formatCurrency(receiptData.total)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={printReceipt} 
              disabled={isPrinting}
              className="flex items-center justify-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'Printing...' : 'Print'}</span>
            </Button>
            
            <Button 
              onClick={downloadReceipt}
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </Button>
            
            {receiptData.customer && (
              <>
                <Button 
                  onClick={emailReceipt}
                  variant="outline"
                  className="flex items-center justify-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </Button>
                
                <Button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `Receipt ${receiptData.saleNumber}`,
                        text: `Receipt for ${formatCurrency(receiptData.total)} from MediCare Pharmacy`,
                        url: window.location.href
                      });
                    } else {
                      toast.info('Sharing not supported on this device');
                    }
                  }}
                  variant="outline"
                  className="flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </Button>
              </>
            )}
          </div>

          <div className="text-center">
            <Button onClick={onClose} variant="ghost" size="sm">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for easy receipt printing
export function useReceiptPrinter() {
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const printReceipt = (data: ReceiptData) => {
    setReceiptData(data);
    setIsOpen(true);
  };

  const ReceiptPrinterComponent = receiptData ? (
    <ReceiptPrinter
      receiptData={receiptData}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  ) : null;

  return {
    printReceipt,
    ReceiptPrinterComponent
  };
}
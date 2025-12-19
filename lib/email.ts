import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"MediCare Pharmacy" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Email templates
export const emailTemplates = {
  lowStockAlert: (medicines: Array<{ name: string; currentStock: number; minStock: number }>) => ({
    subject: '🚨 Low Stock Alert - MediCare Pharmacy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">⚠️ Low Stock Alert</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>The following medicines are running low in stock:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Medicine</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Current Stock</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Min Stock</th>
              </tr>
            </thead>
            <tbody>
              ${medicines.map(med => `
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${med.name}</td>
                  <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; color: #ef4444; font-weight: bold;">${med.currentStock}</td>
                  <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${med.minStock}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <p style="color: #ef4444; font-weight: bold;">
            Please reorder these medicines as soon as possible to avoid stockouts.
          </p>
          
          <div style="margin-top: 30px; padding: 15px; background: #f9fafb; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              This is an automated alert from MediCare Pharmacy Management System.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `Low Stock Alert\n\nThe following medicines are running low:\n${medicines.map(med => `- ${med.name}: ${med.currentStock} (min: ${med.minStock})`).join('\n')}`
  }),

  expiryAlert: (medicines: Array<{ name: string; batchNumber: string; expiryDate: Date; quantity: number }>) => ({
    subject: '⏰ Medicine Expiry Alert - MediCare Pharmacy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">⏰ Expiry Alert</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>The following medicines will expire within 30 days:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Medicine</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Batch</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Quantity</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              ${medicines.map(med => `
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${med.name}</td>
                  <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${med.batchNumber}</td>
                  <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${med.quantity}</td>
                  <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; color: #f59e0b; font-weight: bold;">
                    ${new Date(med.expiryDate).toLocaleDateString()}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <p style="color: #f59e0b; font-weight: bold;">
            Please review these medicines and take appropriate action.
          </p>
        </div>
      </div>
    `,
    text: `Expiry Alert\n\nThe following medicines will expire soon:\n${medicines.map(med => `- ${med.name} (Batch: ${med.batchNumber}): ${new Date(med.expiryDate).toLocaleDateString()}`).join('\n')}`
  }),

  newOrderNotification: (order: any) => ({
    subject: `🛒 New Order #${order.id} - MediCare Pharmacy`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🛒 New Order Received</h1>
        </div>
        
        <div style="padding: 20px;">
          <h2>Order #${order.id}</h2>
          <p><strong>Customer:</strong> ${order.user?.name || 'Guest'}</p>
          <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          
          <h3>Items:</h3>
          <ul>
            ${order.items?.map((item: any) => `
              <li>${item.medicine.name} - Qty: ${item.quantity} - $${item.price.toFixed(2)}</li>
            `).join('') || ''}
          </ul>
          
          <div style="margin-top: 30px; padding: 15px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #065f46;">
              Please process this order as soon as possible.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `New Order #${order.id}\nCustomer: ${order.user?.name || 'Guest'}\nTotal: $${order.total.toFixed(2)}\nStatus: ${order.status}`
  }),

  prescriptionAlert: (prescription: any) => ({
    subject: `📋 New Prescription Upload - MediCare Pharmacy`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">📋 New Prescription</h1>
        </div>
        
        <div style="padding: 20px;">
          <h2>Prescription #${prescription.id}</h2>
          <p><strong>Patient:</strong> ${prescription.user?.name}</p>
          <p><strong>Upload Date:</strong> ${new Date(prescription.uploadedAt).toLocaleString()}</p>
          <p><strong>Status:</strong> ${prescription.verified ? 'Verified' : 'Pending Verification'}</p>
          
          <div style="margin-top: 30px; padding: 15px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; color: #1e40af;">
              A new prescription requires pharmacist verification.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `New Prescription #${prescription.id}\nPatient: ${prescription.user?.name}\nStatus: ${prescription.verified ? 'Verified' : 'Pending'}`
  }),

  receiptEmail: (receiptData: any) => ({
    subject: `🧾 Receipt #${receiptData.saleNumber} - MediCare Pharmacy`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #6366f1; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🧾 Purchase Receipt</h1>
        </div>
        
        <div style="padding: 20px;">
          <h2>Receipt #${receiptData.saleNumber}</h2>
          <p><strong>Date:</strong> ${new Date(receiptData.date).toLocaleString()}</p>
          ${receiptData.customer ? `<p><strong>Customer:</strong> ${receiptData.customer.firstName} ${receiptData.customer.lastName}</p>` : ''}
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Item</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Qty</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">Price</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${receiptData.items.map((item: any) => `
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${item.medicine.name}</td>
                  <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">$${item.unitPrice.toFixed(2)}</td>
                  <td style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="text-align: right; margin-top: 20px;">
            <p><strong>Subtotal: $${receiptData.subtotal.toFixed(2)}</strong></p>
            ${receiptData.discount > 0 ? `<p>Discount: -$${receiptData.discount.toFixed(2)}</p>` : ''}
            <p>Tax: $${receiptData.tax.toFixed(2)}</p>
            <h3 style="color: #6366f1;">Total: $${receiptData.total.toFixed(2)}</h3>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background: #f8fafc; border-radius: 8px;">
            <p style="margin: 0; text-align: center; color: #64748b;">
              Thank you for choosing MediCare Pharmacy!
            </p>
          </div>
        </div>
      </div>
    `,
    text: `Receipt #${receiptData.saleNumber}\nTotal: $${receiptData.total.toFixed(2)}\nThank you for your purchase!`
  })
};

// Notification service
export class NotificationService {
  static async sendLowStockAlert(medicines: Array<{ name: string; currentStock: number; minStock: number }>) {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const template = emailTemplates.lowStockAlert(medicines);
    
    const results = await Promise.all(
      adminEmails.map(email => sendEmail({
        to: email.trim(),
        ...template
      }))
    );
    
    return results;
  }

  static async sendExpiryAlert(medicines: Array<{ name: string; batchNumber: string; expiryDate: Date; quantity: number }>) {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const template = emailTemplates.expiryAlert(medicines);
    
    const results = await Promise.all(
      adminEmails.map(email => sendEmail({
        to: email.trim(),
        ...template
      }))
    );
    
    return results;
  }

  static async sendNewOrderNotification(order: any) {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const template = emailTemplates.newOrderNotification(order);
    
    const results = await Promise.all(
      adminEmails.map(email => sendEmail({
        to: email.trim(),
        ...template
      }))
    );
    
    return results;
  }

  static async sendPrescriptionAlert(prescription: any) {
    const pharmacistEmails = process.env.PHARMACIST_EMAILS?.split(',') || [];
    const template = emailTemplates.prescriptionAlert(prescription);
    
    const results = await Promise.all(
      pharmacistEmails.map(email => sendEmail({
        to: email.trim(),
        ...template
      }))
    );
    
    return results;
  }

  static async sendReceiptEmail(customerEmail: string, receiptData: any) {
    const template = emailTemplates.receiptEmail(receiptData);
    
    return await sendEmail({
      to: customerEmail,
      ...template
    });
  }
}
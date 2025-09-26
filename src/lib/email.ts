import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export interface EmailTemplate {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
}

export interface InvoiceEmailData {
  businessName: string;
  clientName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  dueDate: string;
  paymentUrl: string;
  invoiceUrl: string;
}

export interface PaymentReceiptData {
  businessName: string;
  clientName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  paymentDate: string;
  transactionReference: string;
}

export interface SubscriptionConfirmationData {
  businessName: string;
  planName: string;
  amount: string;
  interval: string;
  nextBillingDate: string;
  features: string[];
}

export interface InvoiceReminderData {
  businessName: string;
  clientName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  dueDate: string;
  daysOverdue: number;
  paymentUrl: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@ardentinvoicing.com';
  private static readonly FROM_NAME = 'Ardent Invoicing';

  // Send invoice email
  static async sendInvoiceEmail(data: InvoiceEmailData): Promise<boolean> {
    try {
      const msg: EmailTemplate = {
        to: data.clientName, // This should be the client's email
        from: {
          email: this.FROM_EMAIL,
          name: this.FROM_NAME,
        },
        subject: `Invoice ${data.invoiceNumber} from ${data.businessName}`,
        html: this.generateInvoiceEmailHTML(data),
        text: this.generateInvoiceEmailText(data),
      };

      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('SendGrid invoice email error:', error);
      return false;
    }
  }

  // Send payment receipt
  static async sendPaymentReceipt(data: PaymentReceiptData): Promise<boolean> {
    try {
      const msg: EmailTemplate = {
        to: data.clientName, // This should be the client's email
        from: {
          email: this.FROM_EMAIL,
          name: this.FROM_NAME,
        },
        subject: `Payment Receipt - Invoice ${data.invoiceNumber}`,
        html: this.generatePaymentReceiptHTML(data),
        text: this.generatePaymentReceiptText(data),
      };

      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('SendGrid payment receipt error:', error);
      return false;
    }
  }

  // Send subscription confirmation
  static async sendSubscriptionConfirmation(data: SubscriptionConfirmationData): Promise<boolean> {
    try {
      const msg: EmailTemplate = {
        to: data.businessName, // This should be the business owner's email
        from: {
          email: this.FROM_EMAIL,
          name: this.FROM_NAME,
        },
        subject: `Subscription Confirmed - ${data.planName} Plan`,
        html: this.generateSubscriptionConfirmationHTML(data),
        text: this.generateSubscriptionConfirmationText(data),
      };

      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('SendGrid subscription confirmation error:', error);
      return false;
    }
  }

  // Send invoice reminder
  static async sendInvoiceReminder(data: InvoiceReminderData): Promise<boolean> {
    try {
      const msg: EmailTemplate = {
        to: data.clientName, // This should be the client's email
        from: {
          email: this.FROM_EMAIL,
          name: this.FROM_NAME,
        },
        subject: `Payment Reminder - Invoice ${data.invoiceNumber}`,
        html: this.generateInvoiceReminderHTML(data),
        text: this.generateInvoiceReminderText(data),
      };

      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('SendGrid invoice reminder error:', error);
      return false;
    }
  }

  // Generate invoice email HTML
  private static generateInvoiceEmailHTML(data: InvoiceEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${data.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #a67c00; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .invoice-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a67c00; }
          .amount { font-size: 24px; font-weight: bold; color: #a67c00; margin: 10px 0; }
          .cta-button { background: #a67c00; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .flag { font-size: 20px; margin-right: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🇬🇭 Invoice from ${data.businessName}</h1>
        </div>
        <div class="content">
          <p>Dear ${data.clientName},</p>
          
          <p>Thank you for your business! Please find your invoice details below:</p>
          
          <div class="invoice-details">
            <h3>Invoice Details</h3>
            <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
            <p><strong>Amount Due:</strong> <span class="amount">${data.currency === 'GHS' ? '🇬🇭' : ''} ${data.amount} ${data.currency}</span></p>
            <p><strong>Due Date:</strong> ${data.dueDate}</p>
            ${data.currency !== 'GHS' ? `<p><strong>Payment Note:</strong> Please pay the equivalent amount in Ghana Cedis (GHS) via Paystack for local processing.</p>` : ''}
          </div>
          
          <div style="text-align: center;">
            <a href="${data.paymentUrl}" class="cta-button">Pay Invoice Now</a>
          </div>
          
          <p>You can also view the full invoice details by <a href="${data.invoiceUrl}">clicking here</a>.</p>
          
          <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>
          The ${data.businessName} Team</p>
        </div>
        
        <div class="footer">
          <p>Powered by Ardent Invoicing - Professional invoicing for Ghanaian SMEs 🇬🇭</p>
        </div>
      </body>
      </html>
    `;
  }

  // Generate payment receipt HTML
  private static generatePaymentReceiptHTML(data: PaymentReceiptData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt - Invoice ${data.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4caf50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .receipt-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; }
          .amount { font-size: 24px; font-weight: bold; color: #4caf50; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Payment Received</h1>
        </div>
        <div class="content">
          <p>Dear ${data.clientName},</p>
          
          <p>Thank you for your payment! We have successfully received your payment for the following invoice:</p>
          
          <div class="receipt-details">
            <h3>Payment Receipt</h3>
            <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
            <p><strong>Amount Paid:</strong> <span class="amount">${data.currency === 'GHS' ? '🇬🇭' : ''} ${data.amount} ${data.currency}</span></p>
            <p><strong>Payment Date:</strong> ${data.paymentDate}</p>
            <p><strong>Transaction Reference:</strong> ${data.transactionReference}</p>
          </div>
          
          <p>Your payment has been processed successfully. If you need a formal receipt, please contact us.</p>
          
          <p>Thank you for your business!</p>
          
          <p>Best regards,<br>
          The ${data.businessName} Team</p>
        </div>
        
        <div class="footer">
          <p>Powered by Ardent Invoicing - Professional invoicing for Ghanaian SMEs 🇬🇭</p>
        </div>
      </body>
      </html>
    `;
  }

  // Generate subscription confirmation HTML
  private static generateSubscriptionConfirmationHTML(data: SubscriptionConfirmationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Confirmed - ${data.planName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #a67c00; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .plan-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a67c00; }
          .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #a67c00; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Subscription Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear ${data.businessName} Team,</p>
          
          <p>Congratulations! Your subscription to the <strong>${data.planName}</strong> plan has been successfully activated.</p>
          
          <div class="plan-details">
            <h3>Subscription Details</h3>
            <p><strong>Plan:</strong> ${data.planName}</p>
            <p><strong>Amount:</strong> <span class="amount">🇬🇭 ₵${data.amount}</span></p>
            <p><strong>Billing:</strong> ${data.interval}</p>
            <p><strong>Next Billing Date:</strong> ${data.nextBillingDate}</p>
          </div>
          
          <div class="features">
            <h3>Your Plan Includes:</h3>
            <ul>
              ${data.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
          
          <p>You can now access all the features included in your plan. Log in to your dashboard to start creating professional invoices and managing your business finances.</p>
          
          <p>If you have any questions about your subscription, please don't hesitate to contact our support team.</p>
          
          <p>Welcome to Ardent Invoicing!</p>
          
          <p>Best regards,<br>
          The Ardent Invoicing Team 🇬🇭</p>
        </div>
        
        <div class="footer">
          <p>Powered by Ardent Invoicing - Professional invoicing for Ghanaian SMEs</p>
        </div>
      </body>
      </html>
    `;
  }

  // Generate invoice reminder HTML
  private static generateInvoiceReminderHTML(data: InvoiceReminderData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Reminder - Invoice ${data.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff9800; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .invoice-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800; }
          .amount { font-size: 24px; font-weight: bold; color: #ff9800; margin: 10px 0; }
          .cta-button { background: #ff9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⏰ Payment Reminder</h1>
        </div>
        <div class="content">
          <p>Dear ${data.clientName},</p>
          
          <p>This is a friendly reminder that your invoice is ${data.daysOverdue > 0 ? `${data.daysOverdue} days overdue` : 'due soon'}.</p>
          
          <div class="invoice-details">
            <h3>Invoice Details</h3>
            <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
            <p><strong>Amount Due:</strong> <span class="amount">${data.currency === 'GHS' ? '🇬🇭' : ''} ${data.amount} ${data.currency}</span></p>
            <p><strong>Due Date:</strong> ${data.dueDate}</p>
            ${data.currency !== 'GHS' ? `<p><strong>Payment Note:</strong> Please pay the equivalent amount in Ghana Cedis (GHS) via Paystack.</p>` : ''}
          </div>
          
          <div style="text-align: center;">
            <a href="${data.paymentUrl}" class="cta-button">Pay Invoice Now</a>
          </div>
          
          <p>If you have already made this payment, please disregard this reminder. If you have any questions or need to discuss payment arrangements, please contact us.</p>
          
          <p>Thank you for your business!</p>
          
          <p>Best regards,<br>
          The ${data.businessName} Team</p>
        </div>
        
        <div class="footer">
          <p>Powered by Ardent Invoicing - Professional invoicing for Ghanaian SMEs 🇬🇭</p>
        </div>
      </body>
      </html>
    `;
  }

  // Generate text versions of emails
  private static generateInvoiceEmailText(data: InvoiceEmailData): string {
    return `
Invoice ${data.invoiceNumber} from ${data.businessName}

Dear ${data.clientName},

Thank you for your business! Please find your invoice details below:

Invoice Number: ${data.invoiceNumber}
Amount Due: ${data.currency === 'GHS' ? '₵' : ''} ${data.amount} ${data.currency}
Due Date: ${data.dueDate}

${data.currency !== 'GHS' ? 'Payment Note: Please pay the equivalent amount in Ghana Cedis (GHS) via Paystack for local processing.' : ''}

To pay this invoice, visit: ${data.paymentUrl}
To view full details, visit: ${data.invoiceUrl}

If you have any questions about this invoice, please don't hesitate to contact us.

Best regards,
The ${data.businessName} Team

Powered by Ardent Invoicing - Professional invoicing for Ghanaian SMEs 🇬🇭
    `;
  }

  private static generatePaymentReceiptText(data: PaymentReceiptData): string {
    return `
Payment Receipt - Invoice ${data.invoiceNumber}

Dear ${data.clientName},

Thank you for your payment! We have successfully received your payment:

Invoice Number: ${data.invoiceNumber}
Amount Paid: ${data.currency === 'GHS' ? '₵' : ''} ${data.amount} ${data.currency}
Payment Date: ${data.paymentDate}
Transaction Reference: ${data.transactionReference}

Your payment has been processed successfully.

Thank you for your business!

Best regards,
The ${data.businessName} Team

Powered by Ardent Invoicing - Professional invoicing for Ghanaian SMEs 🇬🇭
    `;
  }

  private static generateSubscriptionConfirmationText(data: SubscriptionConfirmationData): string {
    return `
Subscription Confirmed - ${data.planName} Plan

Dear ${data.businessName} Team,

Congratulations! Your subscription to the ${data.planName} plan has been successfully activated.

Subscription Details:
Plan: ${data.planName}
Amount: ₵${data.amount}
Billing: ${data.interval}
Next Billing Date: ${data.nextBillingDate}

Your Plan Includes:
${data.features.map(feature => `• ${feature}`).join('\n')}

You can now access all the features included in your plan.

Welcome to Ardent Invoicing!

Best regards,
The Ardent Invoicing Team 🇬🇭

Powered by Ardent Invoicing - Professional invoicing for Ghanaian SMEs
    `;
  }

  private static generateInvoiceReminderText(data: InvoiceReminderData): string {
    return `
Payment Reminder - Invoice ${data.invoiceNumber}

Dear ${data.clientName},

This is a friendly reminder that your invoice is ${data.daysOverdue > 0 ? `${data.daysOverdue} days overdue` : 'due soon'}.

Invoice Details:
Invoice Number: ${data.invoiceNumber}
Amount Due: ${data.currency === 'GHS' ? '₵' : ''} ${data.amount} ${data.currency}
Due Date: ${data.dueDate}

To pay this invoice, visit: ${data.paymentUrl}

If you have already made this payment, please disregard this reminder.

Thank you for your business!

Best regards,
The ${data.businessName} Team

Powered by Ardent Invoicing - Professional invoicing for Ghanaian SMEs 🇬🇭
    `;
  }
}

export default EmailService;

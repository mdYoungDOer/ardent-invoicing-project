import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let success = false;

    switch (type) {
      case 'invoice':
        success = await EmailService.sendInvoiceEmail({
          businessName: data.businessName,
          clientName: data.clientEmail, // This should be the client's email
          invoiceNumber: data.invoiceNumber,
          amount: data.amount,
          currency: data.currency,
          dueDate: data.dueDate,
          paymentUrl: data.paymentUrl,
          invoiceUrl: data.invoiceUrl,
        });
        break;

      case 'payment_receipt':
        success = await EmailService.sendPaymentReceipt({
          businessName: data.businessName,
          clientName: data.clientEmail, // This should be the client's email
          invoiceNumber: data.invoiceNumber,
          amount: data.amount,
          currency: data.currency,
          paymentDate: data.paymentDate,
          transactionReference: data.transactionReference,
        });
        break;

      case 'subscription_confirmation':
        success = await EmailService.sendSubscriptionConfirmation({
          businessName: data.businessName,
          planName: data.planName,
          amount: data.amount,
          interval: data.interval,
          nextBillingDate: data.nextBillingDate,
          features: data.features,
        });
        break;

      case 'invoice_reminder':
        success = await EmailService.sendInvoiceReminder({
          businessName: data.businessName,
          clientName: data.clientEmail, // This should be the client's email
          invoiceNumber: data.invoiceNumber,
          amount: data.amount,
          currency: data.currency,
          dueDate: data.dueDate,
          daysOverdue: data.daysOverdue,
          paymentUrl: data.paymentUrl,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    if (success) {
      // Log email sent to database
      await supabaseAdmin
        .from('email_logs')
        .insert({
          type,
          recipient: data.clientEmail || data.businessName,
          subject: getEmailSubject(type, data),
          sent_at: new Date().toISOString(),
          status: 'sent',
        });

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
      });
    } else {
      // Log failed email
      await supabaseAdmin
        .from('email_logs')
        .insert({
          type,
          recipient: data.clientEmail || data.businessName,
          subject: getEmailSubject(type, data),
          sent_at: new Date().toISOString(),
          status: 'failed',
        });

      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getEmailSubject(type: string, data: any): string {
  switch (type) {
    case 'invoice':
      return `Invoice ${data.invoiceNumber} from ${data.businessName}`;
    case 'payment_receipt':
      return `Payment Receipt - Invoice ${data.invoiceNumber}`;
    case 'subscription_confirmation':
      return `Subscription Confirmed - ${data.planName} Plan`;
    case 'invoice_reminder':
      return `Payment Reminder - Invoice ${data.invoiceNumber}`;
    default:
      return 'Ardent Invoicing Notification';
  }
}

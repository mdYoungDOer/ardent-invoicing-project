import { NextRequest, NextResponse } from 'next/server';
import { PaystackService } from '@/lib/paystack';
import { supabaseAdmin } from '@/lib/supabase';
import { getExchangeRate } from '@/lib/exchange-rates';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, clientEmail, clientName } = body;

    // Validate required fields
    if (!invoiceId || !clientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        tenants!inner(business_name, sme_user_id)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check if invoice is already paid
    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice is already paid' },
        { status: 400 }
      );
    }

    let paymentAmount = invoice.amount;
    const paymentCurrency = 'GHS';

    // Handle currency conversion for non-GHS invoices
    if (invoice.currency !== 'GHS') {
      if (invoice.exchange_rate) {
        // Use stored exchange rate
        paymentAmount = invoice.amount / invoice.exchange_rate;
      } else {
        // Get current exchange rate
        try {
          const rateData = await getExchangeRate(invoice.currency, 'GHS');
          paymentAmount = invoice.amount * rateData.rate;
          
          // Update invoice with exchange rate
          await supabaseAdmin
            .from('invoices')
            .update({ exchange_rate: rateData.rate })
            .eq('id', invoiceId);
        } catch (error) {
          console.error('Exchange rate error:', error);
          return NextResponse.json(
            { error: 'Unable to process payment due to currency conversion error' },
            { status: 500 }
          );
        }
      }
    }

    // Generate transaction reference
    const reference = PaystackService.generateReference('INV');

    // Create or get Paystack customer
    let customerResult = await PaystackService.getCustomerByEmail(clientEmail);
    if (!customerResult.success) {
      customerResult = await PaystackService.createCustomer(
        clientEmail,
        clientName?.split(' ')[0],
        clientName?.split(' ').slice(1).join(' ')
      );
      if (!customerResult.success) {
        return NextResponse.json(
          { error: 'Failed to create customer' },
          { status: 500 }
        );
      }
    }

    const customer = customerResult.data;

    // Initialize transaction
    const transactionResult = await PaystackService.initializeTransaction({
      reference,
      amount: paymentAmount,
      email: clientEmail,
      currency: paymentCurrency,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/client/pay/success?reference=${reference}`,
      metadata: {
        type: 'invoice',
        invoiceId,
        originalAmount: invoice.amount,
        originalCurrency: invoice.currency,
        businessName: invoice.tenants.business_name,
      },
    });

    if (!transactionResult.success) {
      return NextResponse.json(
        { error: transactionResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url: transactionResult.data.authorization_url,
      reference,
      paymentAmount,
      paymentCurrency,
      originalAmount: invoice.amount,
      originalCurrency: invoice.currency,
    });
  } catch (error) {
    console.error('Invoice payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

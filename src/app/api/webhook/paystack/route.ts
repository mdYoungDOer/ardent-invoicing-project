import { NextRequest, NextResponse } from 'next/server';
import { PaystackService } from '@/lib/paystack';
import { EmailService } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase';
import { getPlanById } from '@/lib/subscription-plans';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    if (!PaystackService.verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    console.log('Paystack webhook event:', event.type);

    switch (event.type) {
      case 'subscription.create':
        await handleSubscriptionCreate(event.data);
        break;
      
      case 'subscription.update':
        await handleSubscriptionUpdate(event.data);
        break;
      
      case 'subscription.disable':
        await handleSubscriptionDisable(event.data);
        break;
      
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data);
        break;
      
      default:
        console.log('Unhandled webhook event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreate(data: any) {
  try {
    const { customer, plan, authorization, status } = data;
    
    // Find subscription by customer email or ID
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('paystack_customer_id', customer.id)
      .eq('status', 'pending')
      .single();

    if (subscriptionError || !subscription) {
      console.error('Subscription not found:', subscriptionError);
      return;
    }

    // Get plan details
    const planDetails = getPlanById(subscription.plan_id);
    if (!planDetails) {
      console.error('Plan not found:', subscription.plan_id);
      return;
    }

    // Update subscription in database
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'active',
        paystack_subscription_id: data.id,
        paystack_plan_id: plan.id,
        started_at: new Date().toISOString(),
        next_billing_date: data.next_payment_date,
      })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return;
    }

    // Update user subscription tier
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({
        subscription_tier: subscription.plan_id,
        subscription_status: 'active',
        invoice_quota_used: 0, // Reset quota for new subscription
      })
      .eq('id', subscription.user_id);

    if (userUpdateError) {
      console.error('Error updating user subscription:', userUpdateError);
      return;
    }

    // Get user and tenant details for email
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('email, tenant_id')
      .eq('id', subscription.user_id)
      .single();

    const { data: tenantData } = await supabaseAdmin
      .from('tenants')
      .select('business_name')
      .eq('id', userData?.tenant_id)
      .single();

    // Send subscription confirmation email
    if (userData?.email && tenantData?.business_name) {
      await EmailService.sendSubscriptionConfirmation({
        businessName: tenantData.business_name,
        planName: planDetails.name,
        amount: subscription.amount.toString(),
        interval: subscription.interval,
        nextBillingDate: new Date(data.next_payment_date).toLocaleDateString(),
        features: planDetails.features,
      });
    }

    console.log('Subscription created successfully:', data.id);
  } catch (error) {
    console.error('Error handling subscription create:', error);
  }
}

async function handleSubscriptionUpdate(data: any) {
  try {
    const { id, status } = data;
    
    // Update subscription status
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: status === 'active' ? 'active' : 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('paystack_subscription_id', id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return;
    }

    console.log('Subscription updated successfully:', id);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionDisable(data: any) {
  try {
    const { id } = data;
    
    // Update subscription status
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('paystack_subscription_id', id);

    if (updateError) {
      console.error('Error cancelling subscription:', updateError);
      return;
    }

    // Get subscription details
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq('paystack_subscription_id', id)
      .single();

    if (subscription) {
      // Downgrade user to free plan
      await supabaseAdmin
        .from('users')
        .update({
          subscription_tier: 'free',
          subscription_status: 'cancelled',
        })
        .eq('id', subscription.user_id);
    }

    console.log('Subscription cancelled successfully:', id);
  } catch (error) {
    console.error('Error handling subscription disable:', error);
  }
}

async function handleChargeSuccess(data: any) {
  try {
    const { reference, amount, customer, metadata } = data;
    
    // Handle one-time payments (invoices)
    if (metadata?.type === 'invoice') {
      const { error: updateError } = await supabaseAdmin
        .from('invoices')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_reference: reference,
        })
        .eq('id', metadata.invoiceId);

      if (updateError) {
        console.error('Error updating invoice payment:', updateError);
        return;
      }

      // Get invoice and tenant details for receipt email
      const { data: invoiceData } = await supabaseAdmin
        .from('invoices')
        .select(`
          *,
          tenants!inner(business_name)
        `)
        .eq('id', metadata.invoiceId)
        .single();

      if (invoiceData) {
        await EmailService.sendPaymentReceipt({
          businessName: invoiceData.tenants.business_name,
          clientName: invoiceData.client_name,
          invoiceNumber: invoiceData.invoice_number,
          amount: invoiceData.amount.toString(),
          currency: invoiceData.currency,
          paymentDate: new Date().toLocaleDateString(),
          transactionReference: reference,
        });
      }
    }

    console.log('Charge successful:', reference);
  } catch (error) {
    console.error('Error handling charge success:', error);
  }
}

async function handlePaymentFailed(data: any) {
  try {
    const { reference, customer, metadata } = data;
    
    // Handle failed subscription payments
    if (metadata?.subscriptionId) {
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'past_due',
          last_payment_failed_at: new Date().toISOString(),
        })
        .eq('paystack_subscription_id', metadata.subscriptionId);

      if (updateError) {
        console.error('Error updating failed payment:', updateError);
        return;
      }
    }

    console.log('Payment failed:', reference);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

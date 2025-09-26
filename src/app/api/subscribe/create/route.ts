import { NextRequest, NextResponse } from 'next/server';
import { PaystackService } from '@/lib/paystack';
import { supabaseAdmin } from '@/lib/supabase';
import { getPlanById, calculatePrice } from '@/lib/subscription-plans';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, interval, userEmail, userId } = body;

    // Validate required fields
    if (!planId || !interval || !userEmail || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    // Don't create Paystack transaction for free plan
    if (planId === 'free') {
      // Update user to free plan
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          subscription_tier: 'free',
          subscription_status: 'active',
          invoice_quota_used: 0,
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user to free plan:', updateError);
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully upgraded to free plan',
        plan: plan.name,
      });
    }

    // Calculate amount
    const amount = calculatePrice(plan, interval);

    // Generate transaction reference
    const reference = PaystackService.generateReference('SUB');

    // Create or get Paystack customer
    let customerResult = await PaystackService.getCustomerByEmail(userEmail);
    if (!customerResult.success) {
      customerResult = await PaystackService.createCustomer(userEmail);
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
      amount,
      email: userEmail,
      currency: 'GHS',
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscribe/success?reference=${reference}`,
      metadata: {
        userId,
        planId,
        interval,
        customerId: customer.id,
      },
    });

    if (!transactionResult.success) {
      return NextResponse.json(
        { error: transactionResult.error },
        { status: 500 }
      );
    }

    // Store pending subscription in database
    const { error: insertError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        interval,
        amount,
        currency: 'GHS',
        status: 'pending',
        paystack_reference: reference,
        paystack_customer_id: customer.id,
      });

    if (insertError) {
      console.error('Error storing pending subscription:', insertError);
      return NextResponse.json(
        { error: 'Failed to store subscription data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url: transactionResult.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

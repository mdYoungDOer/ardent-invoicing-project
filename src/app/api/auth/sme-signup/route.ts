import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client with error handling
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing required Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase admin client
    const supabaseAdmin = getSupabaseAdmin();
    
    const { email, password, fullName, businessName, preferredPlan } = await request.json();

    // Validate input
    if (!email || !password || !fullName || !businessName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    console.log('🏢 SME Signup API: Creating business account...');
    console.log('Email:', email);
    console.log('Business:', businessName);
    console.log('Preferred Plan:', preferredPlan || 'free');
    
    // Always start with FREE trial - no paid plans during signup
    const initialPlan = 'free';

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Will be confirmed via email
      user_metadata: {
        full_name: fullName,
        business_name: businessName
      }
    });

    if (authError) {
      console.error('❌ Auth creation error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    console.log('✅ Auth user created, ID:', authData.user.id);

    // Create tenant with service role (bypasses RLS)
    const { data: tenantData, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        business_name: businessName,
        sme_user_id: authData.user.id
      })
      .select()
      .single();

    if (tenantError) {
      console.error('❌ Tenant creation error:', tenantError);
      // Clean up the created user if tenant creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create business profile' },
        { status: 500 }
      );
    }

    console.log('✅ Tenant created, ID:', tenantData.id);

    // Create user record with service role (bypasses RLS)
    // Only insert fields that actually exist in the users table
    const userRecord: any = {
      id: authData.user.id,
      email,
      role: 'sme',
      tenant_id: tenantData.id,
      subscription_tier: initialPlan,
      invoice_quota_used: 0,
      is_unlimited_free: false
    };

    // Add optional fields if they exist
    if (preferredPlan) {
      userRecord.preferred_plan = preferredPlan;
    }
    userRecord.subscription_status = 'trial';
    userRecord.trial_ends_at = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    // Store full_name in user metadata instead of separate column
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert(userRecord);

    if (userError) {
      console.error('❌ User creation error:', userError);
      console.error('❌ User record attempted:', JSON.stringify(userRecord, null, 2));
      console.error('❌ Auth user ID:', authData.user.id);
      console.error('❌ Tenant ID:', tenantData.id);
      
      // Clean up created records
      await supabaseAdmin.from('tenants').delete().eq('id', tenantData.id);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { 
          error: 'Failed to create user profile',
          details: userError.message,
          code: userError.code
        },
        { status: 500 }
      );
    }

    console.log('✅ SME user record created');

    // Send confirmation email
    const { error: emailError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          business_name: businessName
        }
      }
    });

    if (emailError) {
      console.warn('⚠️ Email sending failed:', emailError);
      // Don't fail the signup if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Business account created successfully! You have a 14-day free trial. Please check your email to verify your account.',
      userId: authData.user.id,
      tenantId: tenantData.id,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      preferredPlan: preferredPlan || null
    });

  } catch (error) {
    console.error('❌ SME signup API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

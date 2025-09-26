import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  role: 'super' | 'sme' | 'client';
  tenant_id: string | null;
  subscription_tier: 'free' | 'starter' | 'pro' | 'enterprise';
  invoice_quota_used: number;
  is_unlimited_free: boolean;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data;
}

export async function checkUserRole(userId: string, requiredRole: 'super' | 'sme' | 'client'): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile?.role === requiredRole;
}

export async function incrementInvoiceQuota(userId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_invoice_quota', {
    user_id: userId
  });

  if (error) {
    console.error('Error incrementing invoice quota:', error);
    throw error;
  }
}

export function canCreateInvoice(user: UserProfile): boolean {
  if (user.is_unlimited_free) return true;
  
  const quotaLimits = {
    free: 2,
    starter: 20,
    pro: 400,
    enterprise: 999999
  };

  const limit = quotaLimits[user.subscription_tier];
  return user.invoice_quota_used < limit;
}

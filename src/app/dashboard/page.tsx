'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Alert } from '@mui/material';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import SMELayout from '@/components/sme/SMELayout';
import DashboardContent from '@/components/sme/DashboardContent';

export const dynamic = 'force-dynamic';

interface User {
  id: string;
  email: string;
  role: string;
  tenant_id: string;
  subscription_tier: string;
  invoice_quota_used: number;
  is_unlimited_free?: boolean;
}

interface Tenant {
  id: string;
  business_name: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, tenant } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('🚀 NUCLEAR: Dashboard starting with localStorage approach...');
        
        // NUCLEAR OPTION: Check localStorage first
        const storedUser = localStorage.getItem('ardent_user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            const now = Date.now();
            const userAge = now - userData.timestamp;
            
            console.log('🔍 NUCLEAR: Found stored user data:', {
              id: userData.id,
              email: userData.email,
              role: userData.role,
              age: Math.round(userAge / 1000) + 's ago'
            });
            
            // Check if data is fresh (less than 5 minutes old)
            if (userAge < 5 * 60 * 1000) {
              console.log('✅ NUCLEAR: Using stored user data');
              
              // Set user in store
              useAppStore.getState().setUser(userData);
              
              // Fetch tenant data if needed
              if (userData.tenant_id) {
                const { data: tenantData, error: tenantError } = await supabase
                  .from('tenants')
                  .select('*')
                  .eq('id', userData.tenant_id)
                  .single();

                if (!tenantError && tenantData) {
                  useAppStore.getState().setTenant(tenantData);
                }
              }
              
              console.log('✅ NUCLEAR: Dashboard access granted via localStorage');
              setLoading(false);
              return;
            } else {
              console.log('⚠️ NUCLEAR: Stored data too old, falling back to session');
            }
          } catch (parseError) {
            console.log('⚠️ NUCLEAR: Failed to parse stored data, falling back to session');
          }
        }
        
        // Fallback: Try session-based approach
        console.log('🔍 NUCLEAR: Falling back to session-based authentication...');
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('❌ NUCLEAR: No session found, redirecting to login');
          router.push('/sme/login');
          return;
        }
        
        console.log('✅ NUCLEAR: Session found, proceeding with normal flow');

        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) throw userError;

        if (userData.role !== 'sme') {
          router.push('/sme/login');
          return;
        }

        // Set user in store
        useAppStore.getState().setUser(userData);

        // Fetch tenant data
        if (userData.tenant_id) {
          const { data: tenantData, error: tenantError } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', userData.tenant_id)
            .single();

          if (tenantError) throw tenantError;
          useAppStore.getState().setTenant(tenantData);
        }

      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <SMELayout title="Dashboard">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Typography>Loading...</Typography>
        </Box>
      </SMELayout>
    );
  }

  if (error) {
    return (
      <SMELayout title="Dashboard">
        <Box sx={{ p: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </SMELayout>
    );
  }

  return (
    <SMELayout title="Dashboard">
      <DashboardContent />
    </SMELayout>
  );
}

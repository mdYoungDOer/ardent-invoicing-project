'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Alert } from '@mui/material';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminStorageManager from '@/components/admin/AdminStorageManager';

export const dynamic = 'force-dynamic';

interface User {
  id: string;
  email: string;
  role: string;
}

export default function AdminStoragePage() {
  const router = useRouter();
  const { user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('🚀 Admin Storage: Starting authentication check...');
        
        // NUCLEAR OPTION: Check localStorage first
        const storedAdmin = localStorage.getItem('ardent_admin');
        if (storedAdmin) {
          try {
            const adminData = JSON.parse(storedAdmin);
            const now = Date.now();
            const adminAge = now - adminData.timestamp;
            
            console.log('🔍 NUCLEAR: Found stored admin data:', {
              id: adminData.id,
              email: adminData.email,
              role: adminData.role,
              age: Math.round(adminAge / 1000) + 's ago'
            });
            
            // Check if data is fresh (less than 5 minutes old)
            if (adminAge < 5 * 60 * 1000) {
              console.log('✅ NUCLEAR: Using stored admin data');
              
              // Set admin in store
              useAppStore.getState().setUser(adminData);
              
              console.log('✅ NUCLEAR: Admin storage access granted via localStorage');
              setLoading(false);
              return;
            } else {
              console.log('⚠️ NUCLEAR: Stored admin data too old, falling back to session');
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
          router.push('/admin/login');
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

        if (userData.role !== 'super') {
          router.push('/admin/login');
          return;
        }

        // Set user in store
        useAppStore.getState().setUser(userData);

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
      <AdminLayout title="Storage Management" user={user}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Typography>Loading...</Typography>
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Storage Management" user={user}>
        <Box sx={{ p: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Storage Management" user={user}>
      <AdminStorageManager />
    </AdminLayout>
  );
}

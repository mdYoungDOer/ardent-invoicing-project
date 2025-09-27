'use client';

import React, { useState } from 'react';
import {
  Box,
} from '@mui/material';
import AdminSidebar from './AdminSidebar';
import AdminNotificationCenter from './AdminNotificationCenter';
import { useAdminRealtime } from '@/hooks/useAdminRealtime';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export default function AdminLayout({ 
  children, 
  title, 
  user
}: AdminLayoutProps) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  
  // Initialize admin real-time features
  const { unreadCount } = useAdminRealtime({
    enableSystemMonitoring: true,
    enableNotifications: true,
    onError: (error) => {
      console.error('Admin realtime error:', error);
    }
  });

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <AdminSidebar 
        user={user} 
        onNotificationClick={() => setNotificationOpen(true)}
        unreadCount={unreadCount}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: '100vh',
          ml: { md: '280px' }, // Account for sidebar width
        }}
      >
        {/* Page Content */}
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: 3,
            minHeight: '100vh',
            position: 'relative',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Admin Notification Center */}
      <AdminNotificationCenter 
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
    </Box>
  );
}

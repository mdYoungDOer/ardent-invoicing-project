'use client';

import React from 'react';
import {
  Box,
} from '@mui/material';
import AdminSidebar from './AdminSidebar';

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

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <AdminSidebar user={user} />

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
    </Box>
  );
}

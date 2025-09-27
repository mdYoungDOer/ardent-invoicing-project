'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ExchangeRateTester from '@/components/admin/ExchangeRateTester';

export default function ExchangeRatesPage() {
  return (
    <AdminLayout title="Exchange Rates">
      <ExchangeRateTester />
    </AdminLayout>
  );
}

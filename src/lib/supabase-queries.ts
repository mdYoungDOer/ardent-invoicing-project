import { supabase } from './supabase';
import type { Invoice, InvoiceLineItem, Expense } from './store';
import { StorageService, uploadReceipt as storageUploadReceipt, uploadInvoicePDF as storageUploadInvoicePDF } from './storage';

// Invoice queries
export async function fetchInvoices(tenantId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchInvoiceById(id: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchInvoiceLineItems(invoiceId: string): Promise<InvoiceLineItem[]> {
  const { data, error } = await supabase
    .from('invoice_line_items')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createInvoice(invoiceData: any): Promise<Invoice> {
  const { data, error } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createInvoiceLineItems(lineItems: any[]): Promise<InvoiceLineItem[]> {
  const { data, error } = await supabase
    .from('invoice_line_items')
    .insert(lineItems)
    .select();

  if (error) throw error;
  return data || [];
}

export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function checkInvoiceQuota(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('increment_invoice_quota', {
    user_id: userId,
  });

  if (error) throw error;
  return data;
}

// Expense queries
export async function fetchExpenses(tenantId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('expense_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchExpenseById(id: string, tenantId: string): Promise<Expense | null> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single();

  if (error) throw error;
  return data;
}

export async function createExpense(expenseData: any): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expenseData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateExpense(expenseData: any): Promise<Expense> {
  const { id, tenant_id, ...updates } = expenseData;
  
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .eq('tenant_id', tenant_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// File upload queries - Updated to use new StorageService

export async function uploadReceipt(file: File, path: string): Promise<string> {
  // For backward compatibility, extract tenant ID from path or use current tenant
  const pathParts = path.split('/');
  const tenantId = pathParts[0]?.startsWith('tenant-') ? pathParts[0].replace('tenant-', '') : null;
  
  if (tenantId) {
    const result = await storageUploadReceipt(file, tenantId);
    return result.url;
  } else {
    // Fallback to old method for backward compatibility
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(path, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(data.path);

    return publicUrl;
  }
}

export async function uploadInvoicePDF(file: File, path: string): Promise<string> {
  // For backward compatibility, extract tenant ID from path or use current tenant
  const pathParts = path.split('/');
  const tenantId = pathParts[0]?.startsWith('tenant-') ? pathParts[0].replace('tenant-', '') : null;
  
  if (tenantId) {
    const result = await storageUploadInvoicePDF(file, tenantId);
    return result.url;
  } else {
    // Fallback to old method for backward compatibility
    const { data, error } = await supabase.storage
      .from('invoices')
      .upload(path, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('invoices')
      .getPublicUrl(data.path);

    return publicUrl;
  }
}

// Analytics queries
export async function getInvoiceStats(tenantId: string, startDate?: string, endDate?: string) {
  let query = supabase
    .from('invoices')
    .select('amount, status, currency, created_at')
    .eq('tenant_id', tenantId);

  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error } = await query;

  if (error) throw error;

  const stats = {
    totalInvoices: data?.length || 0,
    totalAmount: data?.reduce((sum, invoice) => sum + invoice.amount, 0) || 0,
    paidInvoices: data?.filter(invoice => invoice.status === 'paid').length || 0,
    pendingInvoices: data?.filter(invoice => ['draft', 'sent'].includes(invoice.status)).length || 0,
    overdueInvoices: data?.filter(invoice => invoice.status === 'overdue').length || 0,
  };

  return stats;
}

export async function getExpenseStats(tenantId: string, startDate?: string, endDate?: string) {
  let query = supabase
    .from('expenses')
    .select('amount, category, expense_date')
    .eq('tenant_id', tenantId);

  if (startDate) {
    query = query.gte('expense_date', startDate);
  }
  if (endDate) {
    query = query.lte('expense_date', endDate);
  }

  const { data, error } = await query;

  if (error) throw error;

  const stats = {
    totalExpenses: data?.length || 0,
    totalAmount: data?.reduce((sum, expense) => sum + expense.amount, 0) || 0,
    categories: data?.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>) || {},
  };

  return stats;
}

// Search and filter queries
export async function searchInvoices(
  tenantId: string, 
  searchTerm: string, 
  filters?: { status?: string; startDate?: string; endDate?: string }
) {
  let query = supabase
    .from('invoices')
    .select('*')
    .eq('tenant_id', tenantId);

  if (searchTerm) {
    query = query.or(`client_name.ilike.%${searchTerm}%,invoice_number.ilike.%${searchTerm}%`);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function searchExpenses(
  tenantId: string, 
  searchTerm: string, 
  filters?: { category?: string; startDate?: string; endDate?: string }
) {
  let query = supabase
    .from('expenses')
    .select('*')
    .eq('tenant_id', tenantId);

  if (searchTerm) {
    query = query.ilike('description', `%${searchTerm}%`);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.startDate) {
    query = query.gte('expense_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('expense_date', filters.endDate);
  }

  const { data, error } = await query.order('expense_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

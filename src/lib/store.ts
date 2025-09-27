import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  role: 'super' | 'sme' | 'client';
  tenant_id: string | null;
  subscription_tier: 'free' | 'starter' | 'pro' | 'enterprise';
  invoice_quota_used: number;
  is_unlimited_free: boolean;
}

export interface Tenant {
  id: string;
  business_name: string;
  sme_user_id: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  invoice_number: string;
  client_name: string;
  client_email: string | null;
  client_phone?: string;
  client_address?: string;
  amount: number;
  currency: string;
  tax_rate: number;
  discount_amount: number;
  exchange_rate?: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  pdf_url?: string;
  notes?: string;
  recurring_config?: any;
  sent_at?: string;
  paid_at?: string;
  reminder_count: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  created_at: string;
}

export interface Expense {
  id: string;
  tenant_id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  expense_date: string;
  receipt_url?: string;
  ocr_text?: string;
  mileage_distance?: number;
  location?: string;
  tags?: string[];
  is_business: boolean;
  created_at: string;
  updated_at: string;
}

interface AppState {
  user: User | null;
  tenant: Tenant | null;
  invoices: Invoice[];
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setTenant: (tenant: Tenant | null) => void;
  setInvoices: (invoices: Invoice[]) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpenseInStore: (expense: Expense) => void;
  removeExpenseFromStore: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      invoices: [],
      expenses: [],
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setTenant: (tenant) => set({ tenant }),
      setInvoices: (invoices) => set({ invoices }),
      
      addInvoice: (invoice) => set((state) => ({
        invoices: [invoice, ...state.invoices]
      })),
      
      updateInvoice: (id, updates) => set((state) => ({
        invoices: state.invoices.map(invoice =>
          invoice.id === id ? { ...invoice, ...updates } : invoice
        )
      })),
      
      setExpenses: (expenses) => set({ expenses }),
      
      addExpense: (expense) => set((state) => ({
        expenses: [expense, ...state.expenses]
      })),
      
      updateExpenseInStore: (expense) => set((state) => ({
        expenses: state.expenses.map(e =>
          e.id === expense.id ? expense : e
        )
      })),
      
      removeExpenseFromStore: (id) => set((state) => ({
        expenses: state.expenses.filter(e => e.id !== id)
      })),
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'ardent-invoicing-store',
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
      }),
    }
  )
);

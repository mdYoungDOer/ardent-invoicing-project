// Core Types for Ardent Invoicing

export interface User {
  id: string;
  email: string;
  role: 'sme' | 'super' | 'client';
  tenant_id?: string;
  subscription_tier: 'free' | 'starter' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'cancelled' | 'past_due' | 'pending';
  invoice_quota_used: number;
  is_unlimited_free: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  business_name: string;
  business_address?: string;
  business_phone?: string;
  business_email?: string;
  sme_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  tenant_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  client_id?: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  currency: Currency;
  status: InvoiceStatus;
  tax_rate: number;
  discount_rate: number;
  notes?: string;
  pdf_url?: string;
  is_recurring: boolean;
  recurring_schedule?: string;
  payment_reference?: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_address?: string;
  exchange_rate?: number;
  sent_at?: string;
  paid_at?: string;
  reminder_count: number;
  created_at: string;
  updated_at: string;
  clients?: Client;
  tenants?: Tenant;
  invoice_line_items: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  tenant_id: string;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  description: string;
  expense_date: string;
  receipt_url?: string;
  latitude?: number;
  longitude?: number;
  ocr_text?: string;
  mileage_distance?: number;
  location?: string;
  tags?: string[];
  is_business: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  interval: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  amount: number;
  currency: string;
  status: 'pending' | 'active' | 'cancelled' | 'past_due';
  paystack_reference?: string;
  paystack_customer_id?: string;
  paystack_subscription_id?: string;
  paystack_plan_id?: string;
  started_at?: string;
  next_billing_date?: string;
  cancelled_at?: string;
  last_payment_failed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  type: EmailType;
  recipient: string;
  subject: string;
  sent_at: string;
  status: 'sent' | 'failed' | 'pending';
  error_message?: string;
  metadata?: Record<string, any>;
}

export interface ClientInvite {
  id: string;
  tenant_id: string;
  client_email: string;
  invite_token: string;
  is_used: boolean;
  expires_at: string;
  created_at: string;
}

export interface InvoiceTemplate {
  id: string;
  tenant_id: string;
  name: string;
  template_data: Record<string, any>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Enums
export type Currency = 'GHS' | 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export type ExpenseCategory = 
  | 'travel' 
  | 'office_supplies' 
  | 'utilities' 
  | 'rent' 
  | 'salaries' 
  | 'marketing' 
  | 'other';

export type EmailType = 
  | 'invoice' 
  | 'payment_receipt' 
  | 'subscription_confirmation' 
  | 'invoice_reminder';

export type UserRole = 'sme' | 'super' | 'client';

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'pending';

export type BillingInterval = 'monthly' | 'quarterly' | 'biannual' | 'annual';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface InvoiceFormData {
  client_id?: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_address?: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  currency: Currency;
  tax_rate: number;
  discount_rate: number;
  notes?: string;
  line_items: InvoiceLineItemFormData[];
  is_recurring: boolean;
  recurring_schedule?: string;
}

export interface InvoiceLineItemFormData {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface ExpenseFormData {
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  description: string;
  expense_date: string;
  receipt_file?: File;
  latitude?: number;
  longitude?: number;
}

export interface ClientFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface SubscriptionFormData {
  planId: string;
  interval: BillingInterval;
  userEmail: string;
  userId: string;
}

// Dashboard Types
export interface DashboardStats {
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  paidRevenue: number;
  totalExpenses: number;
  netIncome: number;
  quotaUsed: number;
  quotaLimit: number;
}

export interface RecentActivity {
  id: string;
  type: 'invoice' | 'expense' | 'payment' | 'subscription';
  title: string;
  description: string;
  amount?: number;
  currency?: Currency;
  date: string;
  status?: string;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
  category?: string;
}

// Payment Types
export interface PaymentData {
  amount: number;
  currency: Currency;
  reference: string;
  email: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  authorization_url?: string;
  reference: string;
  error?: string;
}

// Exchange Rate Types
export interface ExchangeRateData {
  from: Currency;
  to: Currency;
  rate: number;
  timestamp: string;
}

export interface ExchangeRateResponse {
  success: boolean;
  data?: ExchangeRateData;
  error?: string;
}

// OCR Types
export interface OCRResult {
  text: string;
  confidence: number;
  amount?: number;
  date?: string;
  merchant?: string;
}

// Analytics Types
export interface SubscriptionAnalytics {
  plan_id: string;
  interval: string;
  total_subscriptions: number;
  active_subscriptions: number;
  cancelled_subscriptions: number;
  average_amount: number;
  total_revenue: number;
  first_subscription: string;
  latest_subscription: string;
}

export interface InvoiceAnalytics {
  business_name: string;
  subscription_tier: string;
  total_invoices: number;
  paid_invoices: number;
  overdue_invoices: number;
  total_amount: number;
  paid_amount: number;
  average_invoice_amount: number;
  first_invoice: string;
  latest_invoice: string;
}

// Utility Types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface FilterOption {
  key: string;
  label: string;
  value: any;
  operator?: 'equals' | 'contains' | 'greater_than' | 'less_than';
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Theme Types
export interface ThemeConfig {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  mode: 'light' | 'dark';
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Search Types
export interface SearchParams {
  query?: string;
  filters?: FilterOption[];
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

// Export all types individually for better tree-shaking
export type {
  User,
  Tenant,
  Client,
  Invoice,
  InvoiceLineItem,
  Expense,
  Subscription,
  EmailLog,
  ClientInvite,
  InvoiceTemplate,
  Currency,
  InvoiceStatus,
  ExpenseCategory,
  EmailType,
  UserRole,
  SubscriptionTier,
  SubscriptionStatus,
  BillingInterval,
  ApiResponse,
  PaginatedResponse,
  InvoiceFormData,
  InvoiceLineItemFormData,
  ExpenseFormData,
  ClientFormData,
  SubscriptionFormData,
  DashboardStats,
  RecentActivity,
  ChartData,
  PaymentData,
  PaymentResult,
  ExchangeRateData,
  ExchangeRateResponse,
  OCRResult,
  SubscriptionAnalytics,
  InvoiceAnalytics,
  SelectOption,
  TableColumn,
  FilterOption,
  AppError,
  ThemeConfig,
  Notification,
  SearchParams,
};

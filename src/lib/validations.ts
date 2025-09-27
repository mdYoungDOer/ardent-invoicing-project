import { z } from 'zod';

// Invoice validation schemas
export const invoiceLineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit_price: z.number().min(0, 'Unit price must be positive'),
  total_amount: z.number().min(0, 'Total amount must be positive'),
});

export const createInvoiceSchema = z.object({
  client_name: z.string().min(1, 'Client name is required'),
  client_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  client_phone: z.string().optional(),
  client_address: z.string().optional(),
  currency: z.enum(['GHS', 'USD', 'GBP', 'EUR', 'CAD', 'AUD']),
  due_date: z.string().min(1, 'Due date is required'),
  tax_rate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100'),
  discount_amount: z.number().min(0, 'Discount must be positive'),
  notes: z.string().optional(),
  line_items: z.array(invoiceLineItemSchema).min(1, 'At least one line item is required'),
  recurring_config: z.object({
    frequency: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
    next_run: z.string().optional(),
  }).optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
});

// Expense validation schemas
export const createExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.enum(['GHS', 'USD', 'GBP', 'EUR', 'CAD', 'AUD']),
  category: z.string().min(1, 'Category is required'),
  expense_date: z.string().min(1, 'Expense date is required'),
  location: z.string().optional(),
  mileage_distance: z.coerce.number().min(0).optional().or(z.undefined()),
  tags: z.array(z.string()).optional(),
  is_business: z.boolean().default(true),
});

export const updateExpenseSchema = createExpenseSchema.partial();

// User validation schemas
export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  subscription_tier: z.enum(['free', 'starter', 'pro', 'enterprise']),
});

// Tenant validation schemas
export const updateTenantSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
});

// Client invite validation schemas
export const createClientInviteSchema = z.object({
  client_email: z.string().email('Invalid email address'),
  expires_in_days: z.number().min(1).max(30).default(7),
});

// Exchange rate validation
export const exchangeRateSchema = z.object({
  base_currency: z.string(),
  target_currency: z.string(),
  rate: z.number().min(0),
  timestamp: z.string(),
});

// Form types
export type CreateInvoiceData = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceData = z.infer<typeof updateInvoiceSchema>;
export type InvoiceLineItemData = z.infer<typeof invoiceLineItemSchema>;
export type CreateExpenseData = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseData = z.infer<typeof updateExpenseSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type UpdateTenantData = z.infer<typeof updateTenantSchema>;
export type CreateClientInviteData = z.infer<typeof createClientInviteSchema>;
export type ExchangeRateData = z.infer<typeof exchangeRateSchema>;

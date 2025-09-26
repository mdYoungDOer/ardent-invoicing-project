export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    quarterly: number;
    biannual: number;
    annual: number;
  };
  features: string[];
  invoiceLimit: number;
  color: string;
  popular?: boolean;
  paystackPlanCode?: {
    monthly?: string;
    quarterly?: string;
    biannual?: string;
    annual?: string;
  };
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: {
      monthly: 0,
      quarterly: 0,
      biannual: 0,
      annual: 0,
    },
    features: [
      '2 invoices per month',
      'Basic expense tracking',
      'GHS currency support',
      'Mobile app access',
      'Email support',
    ],
    invoiceLimit: 2,
    color: '#9e9e9e',
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For growing businesses',
    price: {
      monthly: 129,
      quarterly: 387,
      biannual: 774,
      annual: 1548,
    },
    features: [
      '20 invoices per month',
      'Advanced expense tracking',
      'Multi-currency support',
      'PDF invoice generation',
      'Basic analytics',
      'Email support',
    ],
    invoiceLimit: 20,
    color: '#ff9800',
    popular: true,
    paystackPlanCode: {
      monthly: 'starter_monthly',
      quarterly: 'starter_quarterly',
      biannual: 'starter_biannual',
      annual: 'starter_annual',
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For established businesses',
    price: {
      monthly: 489,
      quarterly: 1467,
      biannual: 2934,
      annual: 5868,
    },
    features: [
      '400 invoices per month',
      'Advanced analytics & reporting',
      'Custom invoice templates',
      'Team collaboration (up to 5 users)',
      'API access',
      'Priority support',
      'Recurring invoices',
      'Client portal',
    ],
    invoiceLimit: 400,
    color: '#2196f3',
    paystackPlanCode: {
      monthly: 'pro_monthly',
      quarterly: 'pro_quarterly',
      biannual: 'pro_biannual',
      annual: 'pro_annual',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: {
      monthly: 999,
      quarterly: 2997,
      biannual: 5994,
      annual: 11988,
    },
    features: [
      'Unlimited invoices',
      'Advanced reporting & analytics',
      'Custom branding & white-label',
      'Unlimited team members',
      'Full API access',
      'Dedicated support',
      'Custom integrations',
      'Advanced automation',
      'Priority feature requests',
    ],
    invoiceLimit: 999999,
    color: '#4caf50',
    paystackPlanCode: {
      monthly: 'enterprise_monthly',
      quarterly: 'enterprise_quarterly',
      biannual: 'enterprise_biannual',
      annual: 'enterprise_annual',
    },
  },
];

export const BILLING_INTERVALS = [
  { id: 'monthly', label: 'Monthly', discount: 0 },
  { id: 'quarterly', label: 'Quarterly', discount: 5 },
  { id: 'biannual', label: 'Bi-annual', discount: 10 },
  { id: 'annual', label: 'Annual', discount: 20 },
];

export function getPlanById(id: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === id);
}

export function calculatePrice(plan: SubscriptionPlan, interval: string): number {
  const basePrice = plan.price[interval as keyof typeof plan.price];
  const discount = BILLING_INTERVALS.find(i => i.id === interval)?.discount || 0;
  return Math.round(basePrice * (1 - discount / 100));
}

export function getDiscountAmount(plan: SubscriptionPlan, interval: string): number {
  const monthlyPrice = plan.price.monthly;
  const intervalPrice = plan.price[interval as keyof typeof plan.price];
  const discount = BILLING_INTERVALS.find(i => i.id === interval)?.discount || 0;
  
  if (interval === 'quarterly') return monthlyPrice * 3 - intervalPrice;
  if (interval === 'biannual') return monthlyPrice * 6 - intervalPrice;
  if (interval === 'annual') return monthlyPrice * 12 - intervalPrice;
  
  return 0;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

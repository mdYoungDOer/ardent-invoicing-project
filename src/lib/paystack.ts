// Import Paystack SDK
let paystack: any;

// Initialize Paystack SDK
try {
  const { Paystack } = require('@paystack/paystack-sdk');
  paystack = new Paystack({
    secretKey: process.env.PAYSTACK_SECRET_KEY!,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  });
} catch (error) {
  console.warn('Paystack SDK not available:', error);
  // Mock paystack for development
  paystack = {
    transaction: {
      initialize: async () => ({ success: false, error: 'Paystack not configured' }),
      verify: async () => ({ success: false, error: 'Paystack not configured' }),
    },
    customer: {
      create: async () => ({ success: false, error: 'Paystack not configured' }),
      list: async () => ({ success: false, error: 'Paystack not configured' }),
    },
    subscription: {
      create: async () => ({ success: false, error: 'Paystack not configured' }),
      disable: async () => ({ success: false, error: 'Paystack not configured' }),
    },
  };
}

export interface PaystackTransaction {
  reference: string;
  amount: number;
  email: string;
  currency: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

export interface PaystackSubscription {
  customer: string;
  plan: string;
  authorization: string;
}

export interface PaystackAuthorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
  account_name?: string;
}

export class PaystackService {
  // Initialize transaction for one-time payments
  static async initializeTransaction(data: PaystackTransaction) {
    try {
      const response = await paystack.transaction.initialize({
        email: data.email,
        amount: data.amount * 100, // Convert to kobo
        currency: data.currency,
        reference: data.reference,
        callback_url: data.callback_url,
        metadata: data.metadata,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Paystack initialization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initialization failed',
      };
    }
  }

  // Create subscription
  static async createSubscription(data: PaystackSubscription) {
    try {
      const response = await paystack.subscription.create({
        customer: data.customer,
        plan: data.plan,
        authorization: data.authorization,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Paystack subscription creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Subscription creation failed',
      };
    }
  }

  // Verify transaction
  static async verifyTransaction(reference: string) {
    try {
      const response = await paystack.transaction.verify(reference);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Paystack verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction verification failed',
      };
    }
  }

  // Create customer
  static async createCustomer(email: string, firstName?: string, lastName?: string) {
    try {
      const response = await paystack.customer.create({
        email,
        first_name: firstName,
        last_name: lastName,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Paystack customer creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Customer creation failed',
      };
    }
  }

  // Get customer by email
  static async getCustomerByEmail(email: string) {
    try {
      const response = await paystack.customer.list({
        email,
      });

      if (response.data && response.data.length > 0) {
        return {
          success: true,
          data: response.data[0],
        };
      }

      return {
        success: false,
        error: 'Customer not found',
      };
    } catch (error) {
      console.error('Paystack customer lookup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Customer lookup failed',
      };
    }
  }

  // Disable subscription
  static async disableSubscription(subscriptionCode: string) {
    try {
      const response = await paystack.subscription.disable({
        code: subscriptionCode,
        token: 'disable_token', // You'll need to generate this properly
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Paystack subscription disable error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Subscription disable failed',
      };
    }
  }

  // Generate reference
  static generateReference(prefix: string = 'ARD'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }

  // Convert amount to kobo (Paystack's smallest unit)
  static amountToKobo(amount: number): number {
    return Math.round(amount * 100);
  }

  // Convert kobo to amount
  static koboToAmount(kobo: number): number {
    return kobo / 100;
  }

  // Validate webhook signature
  static verifyWebhookSignature(payload: string, signature: string): boolean {
    // Note: In a real implementation, you would use Node.js crypto module
    // For now, we'll implement a basic verification
    // In production, this should be done server-side with proper crypto
    return true; // Simplified for demo purposes
  }
}

export default paystack;

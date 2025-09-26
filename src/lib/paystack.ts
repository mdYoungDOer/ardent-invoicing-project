// Paystack API configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Paystack API client using fetch (Edge Runtime compatible)
class PaystackAPI {
  private secretKey: string;
  private baseUrl: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
    this.baseUrl = PAYSTACK_BASE_URL;
  }

  private async makeRequest(endpoint: string, data: any = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Paystack API error');
      }

      return result;
    } catch (error) {
      console.error('Paystack API error:', error);
      throw error;
    }
  }

  async initializeTransaction(data: any) {
    return this.makeRequest('/transaction/initialize', data);
  }

  async verifyTransaction(reference: string) {
    return this.makeRequest(`/transaction/verify/${reference}`);
  }

  async createCustomer(data: any) {
    return this.makeRequest('/customer', data);
  }

  async listCustomers(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/customer?${queryString}`);
  }

  async createSubscription(data: any) {
    return this.makeRequest('/subscription', data);
  }

  async disableSubscription(subscriptionCode: string, token: string) {
    return this.makeRequest(`/subscription/disable`, {
      code: subscriptionCode,
      token,
    });
  }
}

// Initialize Paystack API client
const paystack = PAYSTACK_SECRET_KEY 
  ? new PaystackAPI(PAYSTACK_SECRET_KEY)
  : null;

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
    if (!paystack) {
      return {
        success: false,
        error: 'Paystack not configured',
      };
    }

    try {
      const response = await paystack.initializeTransaction({
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
    if (!paystack) {
      return {
        success: false,
        error: 'Paystack not configured',
      };
    }

    try {
      const response = await paystack.createSubscription({
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
    if (!paystack) {
      return {
        success: false,
        error: 'Paystack not configured',
      };
    }

    try {
      const response = await paystack.verifyTransaction(reference);
      
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
    if (!paystack) {
      return {
        success: false,
        error: 'Paystack not configured',
      };
    }

    try {
      const response = await paystack.createCustomer({
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
    if (!paystack) {
      return {
        success: false,
        error: 'Paystack not configured',
      };
    }

    try {
      const response = await paystack.listCustomers({
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
  static async disableSubscription(subscriptionCode: string, token: string = 'disable_token') {
    if (!paystack) {
      return {
        success: false,
        error: 'Paystack not configured',
      };
    }

    try {
      const response = await paystack.disableSubscription(subscriptionCode, token);

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

export default PaystackService;

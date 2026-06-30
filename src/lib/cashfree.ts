import crypto from 'crypto';

// Cashfree Configuration
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'sandbox';
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION || '2023-08-01';

const getBaseUrl = () => {
  return CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
};

// Check if credentials are set. If not, run in Simulator Mode.
export const isCashfreeConfigured = () => {
  return CASHFREE_APP_ID !== '' && CASHFREE_SECRET_KEY !== '';
};

interface CashfreeOrderInput {
  orderId: string;
  amount: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
  notifyUrl: string;
}

/**
 * Create order on Cashfree
 */
export async function createCashfreeOrder(input: CashfreeOrderInput) {
  if (!isCashfreeConfigured()) {
    console.log('[Cashfree] API keys not configured. Simulating order creation...');
    return {
      payment_session_id: `mock_session_${input.orderId}`,
      cf_order_id: `cf_mock_${input.orderId}`,
      order_status: 'ACTIVE',
      isMock: true
    };
  }

  const response = await fetch(`${getBaseUrl()}/orders`, {
    method: 'POST',
    headers: {
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'x-api-version': CASHFREE_API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: Number(input.amount.toFixed(2)),
      order_currency: 'INR',
      customer_details: {
        customer_id: input.customerId,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
      },
      order_meta: {
        return_url: input.returnUrl,
        notify_url: input.notifyUrl,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cashfree order creation failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return {
    payment_session_id: data.payment_session_id,
    cf_order_id: data.cf_order_id,
    order_status: data.order_status,
    isMock: false
  };
}

/**
 * Verify Cashfree webhook signature
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  timestamp: string,
  signature: string
): boolean {
  if (!isCashfreeConfigured()) {
    // In simulator mode, trust mock webhooks
    return true;
  }

  const data = timestamp + rawBody;
  const expectedSignature = crypto
    .createHmac('sha256', CASHFREE_SECRET_KEY)
    .update(data)
    .digest('base64');

  return expectedSignature === signature;
}

/**
 * Fetch Order details directly from Cashfree API to verify payment status
 */
export async function getCashfreeOrderDetails(orderId: string) {
  if (!isCashfreeConfigured() || orderId.startsWith('mock_') || orderId.includes('mock')) {
    console.log('[Cashfree] Simulating order verification...');
    return {
      order_id: orderId,
      order_status: 'PAID',
      order_amount: 1.00,
      payment_session_id: `mock_session_${orderId}`,
      isMock: true,
      payments: [
        {
          payment_status: 'SUCCESS',
          payment_amount: 1.00,
          payment_method: { netbanking: { bank_name: 'SBI' } },
          transaction_id: `txn_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        }
      ]
    };
  }

  const response = await fetch(`${getBaseUrl()}/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'x-api-version': CASHFREE_API_VERSION,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cashfree order query failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Refund Cashfree transaction
 */
export async function initiateCashfreeRefund(orderId: string, amount: number, refundId: string, reason: string) {
  if (!isCashfreeConfigured() || orderId.startsWith('mock_') || orderId.includes('mock')) {
    console.log('[Cashfree] Simulating refund initiation...');
    return {
      refund_id: refundId,
      order_id: orderId,
      refund_amount: amount,
      refund_status: 'SUCCESS',
      isMock: true
    };
  }

  const response = await fetch(`${getBaseUrl()}/orders/${orderId}/refunds`, {
    method: 'POST',
    headers: {
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'x-api-version': CASHFREE_API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refund_amount: Number(amount.toFixed(2)),
      refund_id: refundId,
      refund_note: reason,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cashfree refund failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

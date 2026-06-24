// Adapted from fastnet-hotspot/lib/pesapal.ts (proven in production).
// Same Pesapal API 3.0 flow; defaults changed from FASTNET to Synepic.

export type PesapalEnvironment = 'sandbox' | 'production';

export interface PesapalOrderRequest {
  merchantReference: string;
  amount: number;
  description: string;
  callbackUrl: string;
  cancellationUrl?: string;
  phoneNumber: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface PesapalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  status: string;
  error?: unknown;
  message?: string;
}

export interface PesapalTransactionStatus {
  payment_method?: string;
  amount?: number;
  created_date?: string;
  confirmation_code?: string;
  payment_status_description?: 'INVALID' | 'FAILED' | 'COMPLETED' | 'REVERSED' | string;
  description?: string;
  message?: string;
  payment_account?: string;
  call_back_url?: string;
  status?: string;
  error?: unknown;
}

interface PesapalTokenResponse {
  token?: string;
  expiryDate?: string;
  status?: string;
  message?: string;
  error?: unknown;
}

interface PesapalIpnResponse {
  ipn_id?: string;
  url?: string;
  status?: string;
  message?: string;
  error?: unknown;
}

function getPesapalBaseUrl() {
  if (process.env.PESAPAL_BASE_URL) {
    return process.env.PESAPAL_BASE_URL.replace(/\/$/, '');
  }
  const environment = (process.env.PESAPAL_ENVIRONMENT || 'sandbox') as PesapalEnvironment;
  if (environment === 'production') return 'https://pay.pesapal.com/v3/api';
  return 'https://cybqa.pesapal.com/pesapalv3/api';
}

function getPesapalCredentials() {
  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) {
    throw new Error('PesaPal credentials are not configured');
  }
  return { consumerKey, consumerSecret };
}

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof (data as { message?: unknown })?.message === 'string' ? (data as { message: string }).message : response.statusText;
    throw new Error(`PesaPal request failed: ${message}`);
  }
  return data as T;
}

export async function getPesapalToken(): Promise<string> {
  const { consumerKey, consumerSecret } = getPesapalCredentials();
  const data = await requestJson<PesapalTokenResponse>(`${getPesapalBaseUrl()}/Auth/RequestToken`, {
    method: 'POST',
    body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret }),
  });
  if (!data.token) throw new Error(data.message || 'PesaPal did not return an access token');
  return data.token;
}

export async function registerIpnUrl(url: string, notificationType: 'GET' | 'POST' = 'GET'): Promise<PesapalIpnResponse> {
  const token = await getPesapalToken();
  return requestJson<PesapalIpnResponse>(`${getPesapalBaseUrl()}/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ url, ipn_notification_type: notificationType }),
  });
}

export async function submitPesapalOrder(order: PesapalOrderRequest): Promise<PesapalOrderResponse> {
  const notificationId = process.env.PESAPAL_NOTIFICATION_ID;
  if (!notificationId) throw new Error('PESAPAL_NOTIFICATION_ID is not configured');

  const token = await getPesapalToken();
  const payload = {
    id: order.merchantReference,
    currency: process.env.PESAPAL_CURRENCY || 'UGX',
    amount: order.amount,
    description: order.description.slice(0, 100),
    callback_url: order.callbackUrl,
    cancellation_url: order.cancellationUrl,
    notification_id: notificationId,
    redirect_mode: 'TOP_WINDOW',
    billing_address: {
      phone_number: order.phoneNumber,
      email_address: order.email || '',
      country_code: process.env.PESAPAL_COUNTRY_CODE || 'UG',
      first_name: order.firstName || process.env.BRAND_NAME || 'Synepic',
      last_name: order.lastName || 'Customer',
    },
  };

  const data = await requestJson<PesapalOrderResponse>(`${getPesapalBaseUrl()}/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  if (!data.redirect_url || !data.order_tracking_id) {
    throw new Error(data.message || 'PesaPal did not return a redirect URL');
  }
  return data;
}

export async function getPesapalTransactionStatus(orderTrackingId: string): Promise<PesapalTransactionStatus> {
  const token = await getPesapalToken();
  const url = new URL(`${getPesapalBaseUrl()}/Transactions/GetTransactionStatus`);
  url.searchParams.set('orderTrackingId', orderTrackingId);
  return requestJson<PesapalTransactionStatus>(url.toString(), {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function isPesapalCompleted(status: PesapalTransactionStatus) {
  return status.payment_status_description?.toUpperCase() === 'COMPLETED';
}

export function isPesapalFailed(status: PesapalTransactionStatus) {
  const d = status.payment_status_description?.toUpperCase();
  return d === 'FAILED' || d === 'REVERSED' || d === 'INVALID';
}
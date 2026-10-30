import { getPayPalAccessToken, getPayPalBaseUrl, isPayPalConfigured } from './auth';

export interface VerifyWebhookParams {
  authAlgo: string;
  certUrl: string;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
  webhookId: string;
  webhookEvent: any;
}

/**
 * Verifies the authenticity of a PayPal webhook signature using PayPal's
 * POST /v1/notifications/verify-webhook-signature endpoint.
 */
export async function verifyPayPalWebhookSignature(params: VerifyWebhookParams): Promise<boolean> {
  if (!isPayPalConfigured()) {
    // In sandbox simulation / dev mode, accept webhook payloads for testing
    return true;
  }

  const baseUrl = getPayPalBaseUrl();
  const { token, isMock } = await getPayPalAccessToken();

  if (isMock) {
    return true;
  }

  try {
    const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: params.authAlgo,
        cert_url: params.certUrl,
        transmission_id: params.transmissionId,
        transmission_sig: params.transmissionSig,
        transmission_time: params.transmissionTime,
        webhook_id: params.webhookId,
        webhook_event: params.webhookEvent,
      }),
    });

    if (!response.ok) {
      console.warn('Webhook verification endpoint returned error:', response.status);
      return false;
    }

    const data = await response.json();
    return data.verification_status === 'SUCCESS';
  } catch (err) {
    console.error('Error verifying PayPal webhook:', err);
    return false;
  }
}

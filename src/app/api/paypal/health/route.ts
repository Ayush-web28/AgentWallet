import { NextResponse } from 'next/server';
import { getPayPalAccessToken, getPayPalBaseUrl, isPayPalConfigured } from '@/lib/paypal/auth';

export async function GET() {
  const configured = isPayPalConfigured();
  const baseUrl = getPayPalBaseUrl();

  try {
    const authResult = await getPayPalAccessToken();

    return NextResponse.json({
      status: 'ok',
      mode: authResult.isMock ? 'simulated_sandbox' : 'live_sandbox',
      configured,
      baseUrl,
      tokenPreview: authResult.token ? `${authResult.token.slice(0, 8)}...` : null,
      tokenExpiresIn: authResult.expiresIn,
      message: configured
        ? 'PayPal Sandbox API v2 credentials active and verified.'
        : 'Running in resilient Sandbox Simulation mode. Configure PAYPAL_CLIENT_ID & PAYPAL_CLIENT_SECRET for live PayPal Sandbox testing.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        configured,
        baseUrl,
        error: error?.message || 'Failed to connect to PayPal',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

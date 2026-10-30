interface CachedToken {
  token: string;
  expiresAt: number; // Unix timestamp ms
}

let cachedToken: CachedToken | null = null;

export function getPayPalBaseUrl(): string {
  return process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
}

export function isPayPalConfigured(): boolean {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  return Boolean(
    clientId &&
    clientSecret &&
    clientId !== 'mock_client_id_for_sandbox' &&
    clientSecret !== 'mock_client_secret_for_sandbox'
  );
}

/**
 * Retrieves a PayPal OAuth2 Access Token with in-memory caching
 * and automatic refresh 60 seconds before expiration.
 */
export async function getPayPalAccessToken(): Promise<{
  token: string;
  isMock: boolean;
  expiresIn: number;
}> {
  const now = Date.now();

  // Return cached token if valid (with 60-second safety buffer)
  if (cachedToken && cachedToken.expiresAt > now + 60 * 1000) {
    const remainingSeconds = Math.floor((cachedToken.expiresAt - now) / 1000);
    return {
      token: cachedToken.token,
      isMock: cachedToken.token.startsWith('sandbox_sim_'),
      expiresIn: remainingSeconds,
    };
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = getPayPalBaseUrl();

  // If credentials are missing or placeholder, generate safe sandbox mock token
  if (!clientId || !clientSecret || !isPayPalConfigured()) {
    const mockToken = `sandbox_sim_token_${Date.now().toString(36)}`;
    const ttlSeconds = 3600;
    cachedToken = {
      token: mockToken,
      expiresAt: now + ttlSeconds * 1000,
    };
    return {
      token: mockToken,
      isMock: true,
      expiresIn: ttlSeconds,
    };
  }

  // Request token from PayPal OAuth2 endpoint
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(
        `PayPal OAuth error (${response.status}): ${errorText}. Falling back to sandbox simulation.`
      );
      // Fallback to simulation token to allow smooth offline/sandbox execution
      const fallbackToken = `sandbox_sim_fallback_${Date.now().toString(36)}`;
      cachedToken = {
        token: fallbackToken,
        expiresAt: now + 1800 * 1000,
      };
      return {
        token: fallbackToken,
        isMock: true,
        expiresIn: 1800,
      };
    }

    const data = await response.json();
    const expiresIn = data.expires_in || 3600;

    cachedToken = {
      token: data.access_token,
      expiresAt: now + expiresIn * 1000,
    };

    return {
      token: data.access_token,
      isMock: false,
      expiresIn,
    };
  } catch (err: any) {
    console.error('Failed to contact PayPal OAuth endpoint:', err?.message || err);
    const fallbackToken = `sandbox_sim_offline_${Date.now().toString(36)}`;
    cachedToken = {
      token: fallbackToken,
      expiresAt: now + 1800 * 1000,
    };
    return {
      token: fallbackToken,
      isMock: true,
      expiresIn: 1800,
    };
  }
}

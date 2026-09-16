import { env } from '../../../config/env';
import { logger } from '../../../config/logger';
import type { IdentityProviderAdapter } from './provider.interface';

/**
 * Meri Pehchaan OAuth 2.0 provider skeleton.
 *
 * Production integration: https://meripehchaan.gov.in/
 * Requires authorized application registration with MeitY.
 *
 * Until credentials are configured, all methods throw 503.
 */
export class MeriPehchaanProvider implements IdentityProviderAdapter {
  private readonly configured: boolean;
  // Placeholder — replace with official Meri Pehchaan endpoints on integration
  private readonly authEndpoint = 'https://meripehchaan.gov.in/oauth2/authorize';
  private readonly tokenEndpoint = 'https://meripehchaan.gov.in/oauth2/token';

  constructor() {
    this.configured = Boolean(
      env.MERI_PEHCHAAN_CLIENT_ID &&
        env.MERI_PEHCHAAN_CLIENT_SECRET &&
        env.MERI_PEHCHAAN_REDIRECT_URI,
    );
    if (!this.configured) {
      logger.warn('Meri Pehchaan provider is not configured — identity verification will return 503');
    }
  }

  private assertConfigured(): void {
    if (!this.configured) {
      throw Object.assign(
        new Error(
          'Meri Pehchaan integration requires authorized application credentials. ' +
            'Register at https://meripehchaan.gov.in/ and set ' +
            'MERI_PEHCHAAN_CLIENT_ID, MERI_PEHCHAAN_CLIENT_SECRET, MERI_PEHCHAAN_REDIRECT_URI.',
        ),
        { code: 'PROVIDER_NOT_CONFIGURED', status: 503 },
      );
    }
  }

  async getAuthorizationUrl(state: string): Promise<{ url: string; state: string }> {
    this.assertConfigured();
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: env.MERI_PEHCHAAN_CLIENT_ID!,
      redirect_uri: env.MERI_PEHCHAAN_REDIRECT_URI!,
      state,
      scope: 'openid profile',
    });
    return { url: `${this.authEndpoint}?${params.toString()}`, state };
  }

  async handleCallback(code: string, state: string): Promise<{ externalReference: string }> {
    this.assertConfigured();
    const res = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: env.MERI_PEHCHAAN_CLIENT_ID!,
        client_secret: env.MERI_PEHCHAAN_CLIENT_SECRET!,
        redirect_uri: env.MERI_PEHCHAAN_REDIRECT_URI!,
      }),
    });
    if (!res.ok) {
      throw Object.assign(new Error('Meri Pehchaan token exchange failed'), { code: 'PROVIDER_AUTH_FAILED', status: 502 });
    }
    const tokens = (await res.json()) as { access_token: string; sub?: string };
    void state;
    return { externalReference: tokens.sub ?? crypto.randomUUID() };
  }
}

export const meriPehchaanProvider = new MeriPehchaanProvider();

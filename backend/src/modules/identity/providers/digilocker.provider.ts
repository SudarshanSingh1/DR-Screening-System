import { env } from '../../../config/env';
import { logger } from '../../../config/logger';
import type { IdentityProviderAdapter } from './provider.interface';

/**
 * DigiLocker OAuth 2.0 provider skeleton.
 *
 * Production integration requires an authorized DigiLocker Requester account
 * issued by NIC/MeitY: https://www.digilocker.gov.in/requesters
 *
 * Until DIGILOCKER_CLIENT_ID + DIGILOCKER_CLIENT_SECRET are configured,
 * all methods throw a 503 error that the frontend handles as config_unavailable.
 *
 * The actual OAuth flow uses PKCE and server-side token exchange.
 * Client secrets MUST never be exposed to the frontend.
 */
export class DigiLockerProvider implements IdentityProviderAdapter {
  private readonly configured: boolean;
  private readonly authEndpoint = 'https://api.digitallocker.gov.in/public/oauth2/1/authorize';
  private readonly tokenEndpoint = 'https://api.digitallocker.gov.in/public/oauth2/1/token';

  constructor() {
    this.configured = Boolean(
      env.DIGILOCKER_CLIENT_ID &&
        env.DIGILOCKER_CLIENT_SECRET &&
        env.DIGILOCKER_REDIRECT_URI,
    );
    if (!this.configured) {
      logger.warn('DigiLocker provider is not configured — identity verification will return 503');
    }
  }

  private assertConfigured(): void {
    if (!this.configured) {
      throw Object.assign(
        new Error(
          'DigiLocker integration requires authorized requester credentials configured on the backend. ' +
            'Register at https://www.digilocker.gov.in/requesters and set DIGILOCKER_CLIENT_ID, ' +
            'DIGILOCKER_CLIENT_SECRET, DIGILOCKER_REDIRECT_URI.',
        ),
        { code: 'PROVIDER_NOT_CONFIGURED', status: 503 },
      );
    }
  }

  async getAuthorizationUrl(state: string): Promise<{ url: string; state: string }> {
    this.assertConfigured();
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: env.DIGILOCKER_CLIENT_ID!,
      redirect_uri: env.DIGILOCKER_REDIRECT_URI!,
      state,
      scope: 'openid',
    });
    return { url: `${this.authEndpoint}?${params.toString()}`, state };
  }

  async handleCallback(code: string, state: string): Promise<{ externalReference: string }> {
    this.assertConfigured();
    // Exchange authorization code for token (server-side only)
    const res = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: env.DIGILOCKER_CLIENT_ID!,
        client_secret: env.DIGILOCKER_CLIENT_SECRET!,
        redirect_uri: env.DIGILOCKER_REDIRECT_URI!,
      }),
    });
    if (!res.ok) {
      throw Object.assign(new Error('DigiLocker token exchange failed'), { code: 'PROVIDER_AUTH_FAILED', status: 502 });
    }
    const tokens = (await res.json()) as { access_token: string; sub?: string };
    // Return only an opaque reference — never raw document data
    const externalReference = tokens.sub ?? crypto.randomUUID();
    void state; // state validated at session level before calling this
    return { externalReference };
  }
}

export const digiLockerProvider = new DigiLockerProvider();

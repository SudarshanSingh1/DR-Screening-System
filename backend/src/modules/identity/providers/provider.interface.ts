export interface IdentityProviderAdapter {
  /**
   * Returns the authorization URL to redirect the user to.
   * Accepts a cryptographically secure state parameter for CSRF protection.
   */
  getAuthorizationUrl(state: string): Promise<{ url: string; state: string }>;
  /**
   * Handles the OAuth callback, exchanges the code for a minimal
   * verification result. Never returns raw identity document data.
   */
  handleCallback(code: string, state: string): Promise<{ externalReference: string }>;
}

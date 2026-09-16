export interface OtpProvider {
  /**
   * Send a one-time password to the given phone number.
   * Implementations must return the plain OTP so the caller can hash and store it.
   * The raw OTP must NEVER be logged or persisted — only its bcrypt hash is stored.
   */
  send(phone: string, otp: string): Promise<void>;
}

export interface EmailProvider {
  isConfigured(): boolean;
  sendPasswordReset(to: string, resetUrl: string): Promise<void>;
  sendWelcomeEmail(to: string, firstName: string): Promise<void>;
  sendEmailVerificationOtp(to: string, otp: string): Promise<void>;
  sendEmailChangedNotification(to: string): Promise<void>;
  sendAccountActivation(to: string, activationUrl: string): Promise<void>;
}

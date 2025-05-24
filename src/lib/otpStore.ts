
// WARNING: This is an in-memory store for demonstration purposes ONLY.
// It is NOT suitable for production as it's volatile, not scalable, and not secure.
// In a real application, use a secure database or a managed service for OTPs.

interface OtpEntry {
  otp: string;
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, OtpEntry>();
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;

export function storeOtp(phoneNumber: string, otp: string) {
  otpStore.set(phoneNumber, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS, attempts: 0 });
  console.log(`[OTP Store] Stored OTP for ${phoneNumber}: ${otp}`);
}

export function verifyOtp(phoneNumber: string, otpToVerify: string): { success: boolean; message: string } {
  const entry = otpStore.get(phoneNumber);

  if (!entry) {
    return { success: false, message: 'No OTP found for this number or it has expired. Please request a new one.' };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phoneNumber); // Expired
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(phoneNumber); // Too many attempts
    return { success: false, message: 'Too many incorrect OTP attempts. Please request a new one.' };
  }

  if (entry.otp === otpToVerify) {
    otpStore.delete(phoneNumber); // OTP used, delete it
    return { success: true, message: 'OTP verified successfully.' };
  } else {
    entry.attempts += 1;
    otpStore.set(phoneNumber, entry); // Update attempts
    const remainingAttempts = MAX_ATTEMPTS - entry.attempts;
    return { success: false, message: `Invalid OTP. ${remainingAttempts} attempts remaining.` };
  }
}

export function canRequestOtp(phoneNumber: string): boolean {
    // Basic rate limiting: allow new OTP if not in store or if expired.
    // More sophisticated rate limiting would be needed in production.
    const entry = otpStore.get(phoneNumber);
    if (!entry) return true;
    if (Date.now() > entry.expiresAt) {
        otpStore.delete(phoneNumber);
        return true;
    }
    // Could add a cooldown period here if needed.
    return false; 
}

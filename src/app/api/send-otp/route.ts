
import { NextResponse, type NextRequest } from 'next/server';
import { storeOtp, canRequestOtp } from '@/lib/otpStore';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber || typeof phoneNumber !== 'string' || !/^\d{10,15}$/.test(phoneNumber)) {
      return NextResponse.json({ message: 'Invalid phone number format.' }, { status: 400 });
    }

    // Basic check to prevent spamming OTP requests to the same number too quickly
    if (!canRequestOtp(phoneNumber)) {
        // Note: In a real app, you might want a more user-friendly message or a slight delay
        // For now, we'll still proceed but this demonstrates where such a check could go.
        console.warn(`[API Send OTP] Multiple OTP requests for ${phoneNumber} in a short period.`);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    storeOtp(phoneNumber, otp);

    // In a real application, you would integrate an SMS gateway service (e.g., Twilio, Vonage) here
    // and send the `otp` to the `phoneNumber`.
    // For this simulation, we'll just log it to the server console.
    // IMPORTANT: DO NOT send the OTP back in the API response in a real application.
    console.log(`[API Send OTP] Simulated OTP for ${phoneNumber}: ${otp}`);

    return NextResponse.json({ success: true, message: 'OTP has been "sent" to your phone (simulated).' });
  } catch (error) {
    console.error('[API Send OTP] Error:', error);
    return NextResponse.json({ message: 'Failed to send OTP. Please try again later.' }, { status: 500 });
  }
}


import { NextResponse, type NextRequest } from 'next/server';
import { verifyOtp as verifyOtpFromStore } from '@/lib/otpStore';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp } = await request.json();

    if (!phoneNumber || typeof phoneNumber !== 'string' || !/^\d{10,15}$/.test(phoneNumber)) {
      return NextResponse.json({ message: 'Invalid phone number format.' }, { status: 400 });
    }
    if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ message: 'Invalid OTP format. Must be 6 digits.' }, { status: 400 });
    }

    const verificationResult = verifyOtpFromStore(phoneNumber, otp);

    if (verificationResult.success) {
      return NextResponse.json({ success: true, message: verificationResult.message });
    } else {
      // Return 400 for client errors like invalid OTP, 429 for too many attempts if implemented
      return NextResponse.json({ success: false, message: verificationResult.message }, { status: 400 });
    }
  } catch (error) {
    console.error('[API Verify OTP] Error:', error);
    return NextResponse.json({ message: 'Failed to verify OTP. Please try again later.' }, { status: 500 });
  }
}

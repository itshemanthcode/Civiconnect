// This file is no longer used for Firebase Phone Authentication.
// The Firebase SDK handles OTP verification directly from the client using ConfirmationResult.
// You can delete this file.

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'This OTP verification endpoint is deprecated. Use Firebase SDK directly.' }, { status: 410 });
}

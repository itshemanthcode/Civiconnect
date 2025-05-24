// This file is no longer used for Firebase Phone Authentication.
// The Firebase SDK handles OTP sending directly from the client.
// You can delete this file.

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'This OTP sending endpoint is deprecated. Use Firebase SDK directly.' }, { status: 410 });
}

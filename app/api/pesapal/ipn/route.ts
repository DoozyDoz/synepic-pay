import { NextRequest, NextResponse } from 'next/server';

// Pesapal IPN endpoint. For validation this only logs and returns 200 — payments are
// reconciled manually in the Pesapal dashboard and recorded in Invoice Ninja.
// Post-validation: handle the IPN here to auto-confirm and auto-issue Invoice Ninja receipts.
export async function GET(request: NextRequest) {
  console.log('[Pesapal IPN GET]', request.nextUrl.search);
  return NextResponse.json({ status: 'ok' });
}

export async function POST(request: NextRequest) {
  const body = await request.text().catch(() => '');
  console.log('[Pesapal IPN POST]', body);
  return NextResponse.json({ status: 'ok' });
}
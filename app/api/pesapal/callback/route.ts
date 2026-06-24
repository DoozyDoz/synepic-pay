import { NextRequest, NextResponse } from 'next/server';
import { getPesapalTransactionStatus, isPesapalCompleted, isPesapalFailed } from '@/lib/pesapal';

// Pesapal redirects the customer's browser here (GET) with OrderTrackingId after payment.
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const orderTrackingId = request.nextUrl.searchParams.get('OrderTrackingId');

  if (!orderTrackingId) {
    return NextResponse.redirect(new URL('/cancelled', origin));
  }

  try {
    const status = await getPesapalTransactionStatus(orderTrackingId);
    if (isPesapalCompleted(status)) return NextResponse.redirect(new URL('/success', origin));
    if (isPesapalFailed(status)) return NextResponse.redirect(new URL('/cancelled', origin));
    // Pending / unknown — send to success which tells them we're confirming.
    return NextResponse.redirect(new URL('/success', origin));
  } catch (error) {
    console.error('Callback status check error:', error);
    return NextResponse.redirect(new URL('/success', origin));
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { submitPesapalOrder } from '@/lib/pesapal';
import { formatPhoneNumber, isValidUgandaPhone, buildMerchantReference, getPayConfig, PayType } from '@/lib/orders';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, type } = body as { phone?: string; type?: string };

    if (!phone || !type) {
      return NextResponse.json({ success: false, error: 'Phone and type are required' }, { status: 400 });
    }
    if (type !== 'deposit' && type !== 'balance') {
      return NextResponse.json({ success: false, error: 'Invalid payment type' }, { status: 400 });
    }
    if (!isValidUgandaPhone(phone)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid Uganda phone number' }, { status: 400 });
    }

    const appUrl = (process.env.APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`).replace(/\/$/, '');
    const cfg = getPayConfig(type as PayType);
    const ref = buildMerchantReference(type as PayType);

    const order = await submitPesapalOrder({
      merchantReference: ref,
      amount: cfg.amount,
      description: cfg.description,
      phoneNumber: formatPhoneNumber(phone),
      callbackUrl: `${appUrl}/api/pesapal/callback`,
      cancellationUrl: `${appUrl}/cancelled`,
    });

    return NextResponse.json({
      success: true,
      redirect_url: order.redirect_url,
      order_tracking_id: order.order_tracking_id,
      merchant_reference: order.merchant_reference,
    });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Could not start payment' },
      { status: 500 }
    );
  }
}
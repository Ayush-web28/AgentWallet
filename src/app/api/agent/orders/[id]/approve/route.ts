import { NextRequest, NextResponse } from 'next/server';
import { getOrder, saveOrder } from '@/lib/store';
import { captureOrder } from '@/lib/paypal/orders';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await req.json().catch(() => ({}));
    const token = body?.token;

    const order = getOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { error: `Order with ID "${orderId}" not found in store.` },
        { status: 404 }
      );
    }

    if (order.status !== 'PENDING_APPROVAL') {
      return NextResponse.json(
        { error: `Order cannot be approved because current status is "${order.status}".` },
        { status: 400 }
      );
    }

    // Check 15-minute expiration timer
    if (order.approvalExpiresAt && Date.now() > order.approvalExpiresAt) {
      order.status = 'FAILED';
      order.guardrailNotes.push(`Approval expired at ${new Date().toISOString()}`);
      saveOrder(order);
      return NextResponse.json(
        { error: 'Approval window (15 minutes) has expired. Please initiate a new procurement request.' },
        { status: 410 }
      );
    }

    // Verify one-time approval token if provided
    if (order.approvalToken && token && order.approvalToken !== token) {
      return NextResponse.json(
        { error: 'Invalid one-time approval authorization token.' },
        { status: 403 }
      );
    }

    // Execute PayPal capture
    const paypalIdToCapture = order.paypalOrderId || order.id;
    const captureResult = await captureOrder(paypalIdToCapture);

    // Update order status to CAPTURED
    order.status = 'CAPTURED';
    order.executionMode = 'MANUAL_APPROVED';
    order.paypalCaptureId = captureResult.id;
    order.approvalToken = undefined; // Invalidate one-time token
    order.guardrailNotes.push(
      `Human-in-the-loop operator approved and executed PayPal Capture (${captureResult.id}) at ${new Date().toISOString()}.`
    );

    const saved = saveOrder(order);

    return NextResponse.json({
      success: true,
      message: 'Order successfully approved and captured via PayPal Sandbox.',
      captureId: captureResult.id,
      order: saved,
    });
  } catch (error: any) {
    console.error('Approve order error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to approve order.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getOrder, saveOrder } from '@/lib/store';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await req.json().catch(() => ({}));
    const reason = body?.reason || 'Declined by human operator';

    const order = getOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { error: `Order with ID "${orderId}" not found in store.` },
        { status: 404 }
      );
    }

    if (order.status !== 'PENDING_APPROVAL') {
      return NextResponse.json(
        { error: `Order cannot be rejected because current status is "${order.status}".` },
        { status: 400 }
      );
    }

    // Invalidate order
    order.status = 'REJECTED';
    order.executionMode = 'REJECTED';
    order.rejectionReason = reason;
    order.approvalToken = undefined;
    order.guardrailNotes.push(
      `Human operator rejected order at ${new Date().toISOString()}. Reason: ${reason}`
    );

    const saved = saveOrder(order);

    return NextResponse.json({
      success: true,
      message: 'Order rejected and cancelled.',
      order: saved,
    });
  } catch (error: any) {
    console.error('Reject order error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to reject order.' },
      { status: 500 }
    );
  }
}

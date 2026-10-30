import { NextRequest, NextResponse } from 'next/server';
import { verifyPayPalWebhookSignature } from '@/lib/paypal/webhooks';
import { getOrder, saveOrder, getAllOrders } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const event = JSON.parse(rawBody);

    const authAlgo = req.headers.get('paypal-auth-algo') || '';
    const certUrl = req.headers.get('paypal-cert-url') || '';
    const transmissionId = req.headers.get('paypal-transmission-id') || '';
    const transmissionSig = req.headers.get('paypal-transmission-sig') || '';
    const transmissionTime = req.headers.get('paypal-transmission-time') || '';
    const webhookId = process.env.PAYPAL_WEBHOOK_ID || 'mock_webhook_id';

    // Verify webhook signature authenticity
    const isValid = await verifyPayPalWebhookSignature({
      authAlgo,
      certUrl,
      transmissionId,
      transmissionSig,
      transmissionTime,
      webhookId,
      webhookEvent: event,
    });

    if (!isValid) {
      console.warn('Unauthorized PayPal webhook attempt with invalid signature.');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const eventType = event.event_type;
    const resource = event.resource;

    console.log(`Processing PayPal Webhook: ${eventType} (ID: ${event.id})`);

    // Match order by custom_id or paypal order id
    const customId = resource?.custom_id || resource?.supplementary_data?.related_ids?.order_id;
    const paypalOrderId = resource?.id;

    const allOrders = getAllOrders();
    const order = allOrders.find(
      (o) =>
        (customId && o.customId === customId) ||
        (paypalOrderId && o.paypalOrderId === paypalOrderId) ||
        (customId && o.id === customId)
    );

    if (order) {
      const now = new Date().toISOString();

      if (eventType === 'CHECKOUT.ORDER.APPROVED') {
        if (order.status === 'PENDING_APPROVAL') {
          order.status = 'APPROVED';
          order.guardrailNotes.push(`PayPal Webhook CHECKOUT.ORDER.APPROVED received at ${now}.`);
          saveOrder(order);
        }
      } else if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        order.status = 'CAPTURED';
        order.paypalCaptureId = resource?.id || order.paypalCaptureId;
        order.guardrailNotes.push(`PayPal Webhook PAYMENT.CAPTURE.COMPLETED (${resource?.id}) received at ${now}.`);
        saveOrder(order);
      }
    }

    return NextResponse.json({
      received: true,
      eventType,
      matchedOrder: order ? order.id : null,
    });
  } catch (error: any) {
    console.error('PayPal Webhook handling error:', error);
    return NextResponse.json(
      { error: error?.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

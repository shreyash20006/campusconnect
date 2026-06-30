import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { verifyCashfreeWebhookSignature } from '@/lib/cashfree';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headers = req.headers;
    const signature = headers.get('x-webhook-signature') || '';
    const timestamp = headers.get('x-webhook-timestamp') || '';

    // Verify Cashfree Webhook Signature
    const isValid = verifyCashfreeWebhookSignature(rawBody, timestamp, signature);
    if (!isValid) {
      console.error('[Webhook Error] Invalid webhook signature received.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    console.log('[Webhook Received] Event:', payload.type, 'Order ID:', payload.data?.order?.order_id);

    const supabase = createAdminSupabaseClient();
    const orderId = payload.data?.order?.order_id;
    const cfPaymentStatus = payload.data?.payment?.payment_status; // SUCCESS, FAILED, USER_DROPPED
    const transactionId = payload.data?.payment?.cf_payment_id?.toString();
    const amount = payload.data?.payment?.payment_amount;

    // We only process PAYMENT_SUCCESS_WEBHOOK
    if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK' && cfPaymentStatus === 'SUCCESS') {
      // 1. Fetch pending payment & registration details
      const { data: payment, error: payError } = await supabase
        .from('payments')
        .select('*, registrations(*, events(*))')
        .eq('order_id', orderId)
        .single();

      if (payError || !payment) {
        console.error('[Webhook Error] Pending payment record not found for Order ID:', orderId, payError);
        return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
      }

      const registration = payment.registrations;
      if (!registration) {
        return NextResponse.json({ error: 'Registration record not found' }, { status: 404 });
      }

      // If already processed, return success to prevent duplicates
      if (payment.status === 'success') {
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      // Determine payment method string
      let method = 'Unknown';
      const pm = payload.data?.payment?.payment_method;
      if (pm) {
        if (pm.card) method = 'Card';
        else if (pm.upi) method = 'UPI';
        else if (pm.netbanking) method = 'Net Banking';
        else if (pm.wallet) method = 'Wallet';
      }

      // 2. Update payment status
      await supabase
        .from('payments')
        .update({
          status: 'success',
          transaction_id: transactionId,
          payment_method: method
        })
        .eq('order_id', orderId);

      // 3. Update registration status
      await supabase
        .from('registrations')
        .update({
          status: 'approved',
          payment_status: 'paid'
        })
        .eq('id', registration.id);

      // 4. Generate Ticket
      const event = registration.events;
      const ticketCode = `CC-${event.title.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          registration_id: registration.id,
          ticket_id: ticketCode,
          status: 'active'
        })
        .select()
        .single();

      if (ticketError) {
        console.error('[Webhook Error] Ticket generation failed:', ticketError);
      }

      // 5. Create Notification
      await supabase.from('notifications').insert({
        user_id: registration.student_id,
        title: 'Payment Confirmed & Ticket Issued!',
        message: `Your payment of ₹${amount} for ${event.title} is successful. Ticket ID: ${ticketCode}.`,
        type: 'payment'
      });

      // 6. Log Activity
      await supabase.from('activity_logs').insert({
        user_id: registration.student_id,
        action: 'PAYMENT_SUCCESS_WEBHOOK',
        details: { orderId, amount, registrationId: registration.id, ticketId: ticket?.id }
      });

      return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
    }

    // Handle Payment Failure
    if (payload.type === 'PAYMENT_FAILED_WEBHOOK' || cfPaymentStatus === 'FAILED') {
      const { data: payment } = await supabase
        .from('payments')
        .select('*, registrations(*)')
        .eq('order_id', orderId)
        .single();

      if (payment) {
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('order_id', orderId);

        await supabase
          .from('registrations')
          .update({ status: 'cancelled' })
          .eq('id', payment.registration_id);

        await supabase.from('notifications').insert({
          user_id: payment.registrations.student_id,
          title: 'Payment Failed',
          message: `Your payment for order ${orderId} was unsuccessful. Please try again.`,
          type: 'payment'
        });
      }

      return NextResponse.json({ success: true, message: 'Failure webhook logged' });
    }

    return NextResponse.json({ success: true, message: 'Event ignored' });

  } catch (error: any) {
    console.error('[Webhook Exception] error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

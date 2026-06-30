import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { getCashfreeOrderDetails } from '@/lib/cashfree';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('order_id');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!orderId) {
    return NextResponse.redirect(`${appUrl}/dashboard?status=error&message=missing_order_id`);
  }

  try {
    const supabase = createAdminSupabaseClient();

    // 1. Query Cashfree details
    const orderDetails = await getCashfreeOrderDetails(orderId);
    const cfStatus = orderDetails.order_status; // PAID, ACTIVE, EXPIRED

    // Fetch existing payment status from our DB
    const { data: payment, error: payError } = await supabase
      .from('payments')
      .select('*, registrations(*)')
      .eq('order_id', orderId)
      .single();

    if (payError || !payment) {
      console.error('[Verify Error] Payment record not found in DB:', orderId);
      return NextResponse.redirect(`${appUrl}/dashboard?status=error&message=payment_record_not_found`);
    }

    const registration = payment.registrations;

    // 2. If Cashfree reports PAID and our DB payment record is still pending, process it
    if (cfStatus === 'PAID' && payment.status !== 'success') {
      // Find the transaction information
      const successPayment = orderDetails.payments?.find((p: any) => p.payment_status === 'SUCCESS');
      const transactionId = successPayment?.transaction_id || `txn_sys_${Date.now()}`;
      
      let method = 'Unknown';
      const pm = successPayment?.payment_method;
      if (pm) {
        if (pm.card) method = 'Card';
        else if (pm.upi) method = 'UPI';
        else if (pm.netbanking) method = 'Net Banking';
        else if (pm.wallet) method = 'Wallet';
      }

      // Update payment
      await supabase
        .from('payments')
        .update({
          status: 'success',
          transaction_id: transactionId,
          payment_method: method
        })
        .eq('order_id', orderId);

      // Update registration
      await supabase
        .from('registrations')
        .update({
          status: 'approved',
          payment_status: 'paid'
        })
        .eq('id', registration.id);

      // Query event title
      const { data: event } = await supabase
        .from('events')
        .select('title')
        .eq('id', registration.event_id)
        .single();

      const eventTitle = event?.title || 'Event';
      const ticketCode = `CC-${eventTitle.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Insert Ticket
      const { data: ticket } = await supabase
        .from('tickets')
        .insert({
          registration_id: registration.id,
          ticket_id: ticketCode,
          status: 'active'
        })
        .select()
        .single();

      // Notify User
      await supabase.from('notifications').insert({
        user_id: registration.student_id,
        title: 'Payment Confirmed & Ticket Issued!',
        message: `Your payment for ${eventTitle} is successful. Ticket ID: ${ticketCode}.`,
        type: 'payment'
      });

      // Log Activity
      await supabase.from('activity_logs').insert({
        user_id: registration.student_id,
        action: 'PAYMENT_VERIFIED_REDIRECT',
        details: { orderId, registrationId: registration.id, ticketId: ticket?.id }
      });

      if (ticket) {
        return NextResponse.redirect(`${appUrl}/tickets/${ticket.id}?status=success`);
      }
    } else if (payment.status === 'success') {
      // Already success, find ticket to redirect
      const { data: ticket } = await supabase
        .from('tickets')
        .select('id')
        .eq('registration_id', registration.id)
        .single();

      if (ticket) {
        return NextResponse.redirect(`${appUrl}/tickets/${ticket.id}?status=success`);
      }
    }

    if (cfStatus === 'FAILED' || cfStatus === 'EXPIRED') {
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('order_id', orderId);

      await supabase
        .from('registrations')
        .update({ status: 'cancelled' })
        .eq('id', registration.id);

      return NextResponse.redirect(`${appUrl}/dashboard?status=failed&message=payment_failed`);
    }

    return NextResponse.redirect(`${appUrl}/dashboard?status=pending&order_id=${orderId}`);

  } catch (error: any) {
    console.error('[Verify Exception] Redirect verification failed:', error);
    return NextResponse.redirect(`${appUrl}/dashboard?status=error&message=${encodeURIComponent(error.message)}`);
  }
}

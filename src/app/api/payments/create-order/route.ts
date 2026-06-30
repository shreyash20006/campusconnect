import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { createCashfreeOrder } from '@/lib/cashfree';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, studentId, name, email, phone, prn, department, semester, teamName, teamMembers, emergencyContact } = body;

    if (!eventId || !studentId) {
      return NextResponse.json({ error: 'Event ID and Student ID are required' }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // 1. Fetch event details to confirm pricing
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check registration deadline
    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      return NextResponse.json({ error: 'Registration deadline has passed' }, { status: 400 });
    }

    // Check registration limit
    if (event.registration_limit) {
      const { count, error: countError } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'approved');

      if (!countError && count && count >= event.registration_limit) {
        return NextResponse.json({ error: 'Event is fully registered' }, { status: 400 });
      }
    }

    // Generate custom human-readable ticket ID base
    const ticketCode = `CC-${event.title.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // CASE A: FREE EVENT
    if (!event.is_paid || Number(event.price) === 0) {
      // Create approved registration
      const { data: reg, error: regError } = await supabase
        .from('registrations')
        .insert({
          event_id: eventId,
          student_id: studentId,
          team_name: teamName || null,
          team_members: teamMembers || [],
          emergency_contact: emergencyContact || '',
          status: 'approved',
          payment_status: 'paid'
        })
        .select()
        .single();

      if (regError) {
        // Check for duplicate registration error
        if (regError.code === '23505') {
          return NextResponse.json({ error: 'You are already registered for this event' }, { status: 400 });
        }
        return NextResponse.json({ error: regError.message }, { status: 500 });
      }

      // Generate Ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          registration_id: reg.id,
          ticket_id: ticketCode,
          status: 'active'
        })
        .select()
        .single();

      if (ticketError) {
        return NextResponse.json({ error: ticketError.message }, { status: 500 });
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: studentId,
        action: 'REGISTER_FREE',
        details: { eventId, registrationId: reg.id, ticketId: ticket.id }
      });

      // Insert Notification
      await supabase.from('notifications').insert({
        user_id: studentId,
        title: 'Registration Successful!',
        message: `You have successfully registered for ${event.title}. Your ticket ID is ${ticketCode}.`,
        type: 'registration'
      });

      return NextResponse.json({
        success: true,
        isPaid: false,
        registrationId: reg.id,
        ticketId: ticket.id,
        ticketCode
      });
    }

    // CASE B: PAID EVENT
    const orderId = `order_${eventId.substring(0, 4)}_${studentId.substring(0, 4)}_${Date.now()}`;

    // Create pending registration
    const { data: reg, error: regError } = await supabase
      .from('registrations')
      .insert({
        event_id: eventId,
        student_id: studentId,
        team_name: teamName || null,
        team_members: teamMembers || [],
        emergency_contact: emergencyContact || '',
        status: 'pending',
        payment_status: 'unpaid'
      })
      .select()
      .single();

    if (regError) {
      if (regError.code === '23505') {
        // If there's already a pending registration, delete it to allow re-attempt or update
        await supabase
          .from('registrations')
          .delete()
          .eq('event_id', eventId)
          .eq('student_id', studentId)
          .eq('status', 'pending');
        
        // Try inserting again
        const { data: retryReg, error: retryError } = await supabase
          .from('registrations')
          .insert({
            event_id: eventId,
            student_id: studentId,
            team_name: teamName || null,
            team_members: teamMembers || [],
            emergency_contact: emergencyContact || '',
            status: 'pending',
            payment_status: 'unpaid'
          })
          .select()
          .single();

        if (retryError) {
          return NextResponse.json({ error: 'You are already registered or have a completed payment for this event.' }, { status: 400 });
        }
        
        // Set reg reference to retry insert
        Object.assign(reg || {}, retryReg);
      } else {
        return NextResponse.json({ error: regError.message }, { status: 500 });
      }
    }

    const finalReg = reg || { id: '' };

    // Insert pending payment record
    const { error: payError } = await supabase
      .from('payments')
      .insert({
        registration_id: finalReg.id,
        amount: Number(event.price),
        status: 'pending',
        order_id: orderId
      });

    if (payError) {
      return NextResponse.json({ error: payError.message }, { status: 500 });
    }

    // Create Cashfree Order
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const cashfreeOrder = await createCashfreeOrder({
      orderId,
      amount: Number(event.price),
      customerId: studentId,
      customerName: name || 'Student',
      customerEmail: email || 'student@campusconnect.edu',
      customerPhone: phone || '9999999999',
      returnUrl: `${appUrl}/api/payments/verify?order_id=${orderId}`,
      notifyUrl: `${appUrl}/api/payments/webhook`
    });

    return NextResponse.json({
      success: true,
      isPaid: true,
      registrationId: finalReg.id,
      orderId,
      paymentSessionId: cashfreeOrder.payment_session_id,
      isMock: cashfreeOrder.isMock
    });

  } catch (error: any) {
    console.error('Error in create-order API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

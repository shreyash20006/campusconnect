import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { ticketId, scannerUserId } = await req.json();

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    // 1. Verify scan authority
    // Check scanner role using createServerSupabaseClient (user session)
    const clientSupabase = await createServerSupabaseClient();
    const { data: { user: currentUser } } = await clientSupabase.auth.getUser();

    // Use either the logged in user or fallback scannerUserId (for mock/local development testing)
    const effectiveScannerId = currentUser?.id || scannerUserId;
    if (!effectiveScannerId) {
      return NextResponse.json({ error: 'Unauthorized scanner session' }, { status: 401 });
    }

    const supabaseAdmin = createAdminSupabaseClient();
    const { data: scannerProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', effectiveScannerId)
      .single();

    if (!scannerProfile || !['volunteer', 'event_organizer', 'admin', 'super_admin'].includes(scannerProfile.role)) {
      return NextResponse.json({
        error: 'Forbidden. Only volunteers, organizers, or admins can scan tickets.'
      }, { status: 403 });
    }

    // 2. Lookup Ticket
    // Supports both UUID format or human-readable code format (e.g., CC-XYZ-12345)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticketId);
    
    let query = supabaseAdmin
      .from('tickets')
      .select('*, registrations(*, profiles(*), events(*))');

    if (isUuid) {
      query = query.eq('id', ticketId);
    } else {
      query = query.eq('ticket_id', ticketId);
    }

    const { data: ticket, error: ticketError } = await query.maybeSingle();

    if (ticketError || !ticket) {
      return NextResponse.json({
        status: 'invalid',
        error: 'Ticket not found. Invalid QR code or ticket ID.'
      }, { status: 404 });
    }

    const registration = ticket.registrations;
    const student = registration?.profiles;
    const event = registration?.events;

    if (!registration || !student || !event) {
      return NextResponse.json({
        status: 'invalid',
        error: 'Corrupted ticket data. Registration details missing.'
      }, { status: 400 });
    }

    // 3. Check Payment Status
    if (registration.payment_status !== 'paid') {
      return NextResponse.json({
        status: 'unpaid',
        student: {
          name: student.name,
          prn: student.prn,
          department: student.department
        },
        event: {
          title: event.title
        },
        error: 'This registration has not been paid for.'
      }, { status: 400 });
    }

    // 4. Check Check-In Status
    if (ticket.status === 'used') {
      // Fetch check-in history to show when they checked in
      const { data: checkInRecord } = await supabaseAdmin
        .from('attendance')
        .select('checked_in_at, profiles(name)')
        .eq('ticket_id', ticket.id)
        .order('checked_in_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const timeStr = checkInRecord ? new Date(checkInRecord.checked_in_at).toLocaleTimeString() : 'earlier';
      const scannerName = (checkInRecord?.profiles as any)?.name || 'another organizer';

      return NextResponse.json({
        status: 'duplicate',
        student: {
          name: student.name,
          prn: student.prn,
          department: student.department,
          semester: student.semester
        },
        event: {
          title: event.title
        },
        checkedInAt: checkInRecord?.checked_in_at,
        error: `Duplicate Scan! Already checked in at ${timeStr} by ${scannerName}.`
      }, { status: 200 });
    }

    if (ticket.status === 'void') {
      return NextResponse.json({
        status: 'void',
        error: 'This ticket has been marked void by administrators.'
      }, { status: 400 });
    }

    // 5. Success Check-In Process
    // Insert attendance log
    const { data: attendanceLog, error: attendError } = await supabaseAdmin
      .from('attendance')
      .insert({
        ticket_id: ticket.id,
        checked_in_by: effectiveScannerId
      })
      .select()
      .single();

    if (attendError) {
      return NextResponse.json({ error: attendError.message }, { status: 500 });
    }

    // Update ticket status to used
    await supabaseAdmin
      .from('tickets')
      .update({ status: 'used' })
      .eq('id', ticket.id);

    // Notify Student
    await supabaseAdmin.from('notifications').insert({
      user_id: student.id,
      title: 'Checked In Successfully!',
      message: `You have been checked in at ${event.title}. Welcome!`,
      type: 'attendance'
    });

    // Auto-generate certificate if event has ended or optionally on check-in
    // We will issue the certificate right upon check-in for instant user satisfaction!
    const certCode = `CC-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const certHash = crypto.createHash('sha256').update(`${registration.id}-${certCode}`).digest('hex');

    await supabaseAdmin
      .from('certificates')
      .insert({
        registration_id: registration.id,
        certificate_id: certCode,
        hash_signature: certHash
      })
      .select()
      .maybeSingle();

    await supabaseAdmin.from('notifications').insert({
      user_id: student.id,
      title: 'Certificate Issued!',
      message: `Congratulations! Your certificate for ${event.title} has been generated. ID: ${certCode}.`,
      type: 'certificate'
    });

    // Log check-in action
    await supabaseAdmin.from('activity_logs').insert({
      user_id: student.id,
      action: 'CHECK_IN_SUCCESS',
      details: { ticketId: ticket.id, scannerId: effectiveScannerId, attendanceId: attendanceLog.id }
    });

    return NextResponse.json({
      status: 'success',
      student: {
        name: student.name,
        prn: student.prn,
        department: student.department,
        semester: student.semester,
        avatarUrl: student.avatar_url
      },
      event: {
        title: event.title
      },
      checkedInAt: attendanceLog.checked_in_at
    });

  } catch (error: any) {
    console.error('[Check-In Exception] error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

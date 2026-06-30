import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { registrationId } = await req.json();

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
    }

    // Guard route for administrators
    const clientSupabase = await createServerSupabaseClient();
    const { data: { user } } = await clientSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const supabaseAdmin = createAdminSupabaseClient();
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin', 'event_organizer'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    // Fetch registration details
    const { data: reg, error: regError } = await supabaseAdmin
      .from('registrations')
      .select('*, profiles(*), events(*)')
      .eq('id', registrationId)
      .single();

    if (regError || !reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabaseAdmin
      .from('certificates')
      .select('*')
      .eq('registration_id', registrationId)
      .maybeSingle();

    if (existingCert) {
      return NextResponse.json({
        success: true,
        message: 'Certificate already exists',
        certificate: existingCert
      });
    }

    // Generate certificate code and signature
    const certCode = `CC-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const certHash = crypto.createHash('sha256').update(`${registrationId}-${certCode}`).digest('hex');

    const { data: certificate, error: certError } = await supabaseAdmin
      .from('certificates')
      .insert({
        registration_id: registrationId,
        certificate_id: certCode,
        hash_signature: certHash
      })
      .select()
      .single();

    if (certError) {
      return NextResponse.json({ error: certError.message }, { status: 500 });
    }

    // Notify student
    await supabaseAdmin.from('notifications').insert({
      user_id: reg.student_id,
      title: 'Certificate Awarded!',
      message: `You have been awarded a certificate for ${reg.events.title}. ID: ${certCode}.`,
      type: 'certificate'
    });

    return NextResponse.json({
      success: true,
      message: 'Certificate generated successfully',
      certificate
    });

  } catch (error: any) {
    console.error('[Manual Certificate Exception] error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

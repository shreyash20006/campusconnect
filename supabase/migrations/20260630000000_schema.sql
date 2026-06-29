-- CampusConnect PostgreSQL Database Schema Migration
-- Target: Supabase / PostgreSQL

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create update trigger function
create or replace function update_modified_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- 1. PROFILES (Synchronized with auth.users)
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null unique,
    name text,
    prn text unique,
    phone text,
    department text,
    semester text,
    role text not null default 'student' check (role in ('student', 'volunteer', 'event_organizer', 'admin', 'super_admin')),
    avatar_url text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- 2. CLUBS (Organizers/Departments hosting events)
create table public.clubs (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    logo_url text,
    banner_url text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS for clubs
alter table public.clubs enable row level security;

-- 3. EVENTS
create table public.events (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text not null,
    short_description text,
    date_time timestamp with time zone not null,
    end_date_time timestamp with time zone not null,
    venue text not null,
    location_coordinates jsonb, -- {lat: number, lng: number}
    club_id uuid references public.clubs(id) on delete set null,
    banner_url text,
    registration_limit integer,
    registration_deadline timestamp with time zone,
    category text not null, -- Technical, Cultural, Sports, Workshop, Seminar, etc.
    status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
    is_paid boolean not null default false,
    price numeric(10,2) not null default 0.00,
    max_team_size integer not null default 1,
    speakers jsonb not null default '[]'::jsonb, -- array of {name, designation, company, avatar_url}
    sponsors jsonb not null default '[]'::jsonb, -- array of {name, logo_url}
    agenda jsonb not null default '[]'::jsonb, -- array of {time, title, description, speaker}
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS for events
alter table public.events enable row level security;

-- 4. REGISTRATIONS
create table public.registrations (
    id uuid primary key default gen_random_uuid(),
    event_id uuid not null references public.events(id) on delete cascade,
    student_id uuid not null references public.profiles(id) on delete cascade,
    team_name text,
    team_members jsonb default '[]'::jsonb, -- array of student details {name, prn, email, phone}
    emergency_contact text,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
    payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    unique (event_id, student_id)
);

-- Enable RLS for registrations
alter table public.registrations enable row level security;

-- 5. TICKETS
create table public.tickets (
    id uuid primary key default gen_random_uuid(),
    registration_id uuid not null unique references public.registrations(id) on delete cascade,
    ticket_id text not null unique, -- CC-EVT-XXXXX
    status text not null default 'active' check (status in ('active', 'used', 'void')),
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS for tickets
alter table public.tickets enable row level security;

-- 6. ATTENDANCE
create table public.attendance (
    id uuid primary key default gen_random_uuid(),
    ticket_id uuid not null references public.tickets(id) on delete cascade,
    checked_in_by uuid references public.profiles(id) on delete set null,
    checked_in_at timestamp with time zone default now() not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS for attendance
alter table public.attendance enable row level security;

-- 7. PAYMENTS
create table public.payments (
    id uuid primary key default gen_random_uuid(),
    registration_id uuid not null references public.registrations(id) on delete cascade,
    amount numeric(10,2) not null,
    status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'refunded')),
    order_id text not null unique, -- Cashfree order id
    transaction_id text, -- Cashfree transaction id
    payment_method text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS for payments
alter table public.payments enable row level security;

-- 8. REFUNDS
create table public.refunds (
    id uuid primary key default gen_random_uuid(),
    payment_id uuid not null references public.payments(id) on delete cascade,
    amount numeric(10,2) not null,
    status text not null default 'pending' check (status in ('pending', 'processed', 'failed')),
    refund_id text unique, -- Cashfree refund id
    reason text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS for refunds
alter table public.refunds enable row level security;

-- 9. SETTLEMENTS
create table public.settlements (
    id uuid primary key default gen_random_uuid(),
    total_collected numeric(10,2) not null,
    settled_amount numeric(10,2) not null,
    pending_amount numeric(10,2) not null,
    status text not null default 'pending' check (status in ('pending', 'settled')),
    settlement_date date,
    reference_id text unique,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS for settlements
alter table public.settlements enable row level security;

-- 10. CERTIFICATES
create table public.certificates (
    id uuid primary key default gen_random_uuid(),
    registration_id uuid not null unique references public.registrations(id) on delete cascade,
    certificate_id text not null unique, -- CC-CERT-XXXXX
    hash_signature text not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS for certificates
alter table public.certificates enable row level security;

-- 11. NOTIFICATIONS
create table public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    message text not null,
    type text not null check (type in ('registration', 'payment', 'attendance', 'certificate', 'announcement')),
    is_read boolean not null default false,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS for notifications
alter table public.notifications enable row level security;

-- 12. ACTIVITY_LOGS
create table public.activity_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete set null,
    action text not null,
    details jsonb not null default '{}'::jsonb,
    ip_address text,
    created_at timestamp with time zone default now() not null
);

-- Enable RLS for activity logs
alter table public.activity_logs enable row level security;

-- 13. VOLUNTEERS
create table public.volunteers (
    id uuid primary key default gen_random_uuid(),
    event_id uuid not null references public.events(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    role_description text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    unique (event_id, user_id)
);

-- Enable RLS for volunteers
alter table public.volunteers enable row level security;


----------------- UPDATE TRIGGERS DEFINITION -----------------
create trigger update_profiles_updated_at before update on public.profiles for each row execute procedure update_modified_column();
create trigger update_clubs_updated_at before update on public.clubs for each row execute procedure update_modified_column();
create trigger update_events_updated_at before update on public.events for each row execute procedure update_modified_column();
create trigger update_registrations_updated_at before update on public.registrations for each row execute procedure update_modified_column();
create trigger update_tickets_updated_at before update on public.tickets for each row execute procedure update_modified_column();
create trigger update_attendance_updated_at before update on public.attendance for each row execute procedure update_modified_column();
create trigger update_payments_updated_at before update on public.payments for each row execute procedure update_modified_column();
create trigger update_refunds_updated_at before update on public.refunds for each row execute procedure update_modified_column();
create trigger update_settlements_updated_at before update on public.settlements for each row execute procedure update_modified_column();
create trigger update_certificates_updated_at before update on public.certificates for each row execute procedure update_modified_column();
create trigger update_notifications_updated_at before update on public.notifications for each row execute procedure update_modified_column();
create trigger update_volunteers_updated_at before update on public.volunteers for each row execute procedure update_modified_column();


----------------- AUTO-CREATE PROFILE TRIGGER -----------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, name, role)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        coalesce(new.raw_user_meta_data->>'role', 'student')
    );
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();


----------------- ROW LEVEL SECURITY (RLS) POLICIES -----------------

-- PROFILES
create policy "Allow public read access to profiles" on public.profiles for select using (true);
create policy "Allow users to update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Allow admins to delete profiles" on public.profiles for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);

-- CLUBS
create policy "Allow public read access to clubs" on public.clubs for select using (true);
create policy "Allow admins to manage clubs" on public.clubs for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);

-- EVENTS
create policy "Allow public read access to published events" on public.events for select using (status = 'published' or status = 'archived' or exists (
    select 1 from public.profiles where id = auth.uid() and role in ('event_organizer', 'admin', 'super_admin')
));
create policy "Allow organizers/admins to manage events" on public.events for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('event_organizer', 'admin', 'super_admin'))
);

-- REGISTRATIONS
create policy "Allow users to read their own registrations" on public.registrations for select using (
    student_id = auth.uid() or exists (
        select 1 from public.profiles where id = auth.uid() and role in ('event_organizer', 'admin', 'super_admin', 'volunteer')
    )
);
create policy "Allow students to insert their own registrations" on public.registrations for insert with check (student_id = auth.uid());
create policy "Allow students/organizers to update registrations" on public.registrations for update using (
    student_id = auth.uid() or exists (
        select 1 from public.profiles where id = auth.uid() and role in ('event_organizer', 'admin', 'super_admin', 'volunteer')
    )
);

-- TICKETS
create policy "Allow users to read their own tickets" on public.tickets for select using (
    exists (
        select 1 from public.registrations r 
        where r.id = registration_id and (r.student_id = auth.uid() or exists (
            select 1 from public.profiles where id = auth.uid() and role in ('event_organizer', 'admin', 'super_admin', 'volunteer')
        ))
    )
);
create policy "Allow organizers/volunteers to manage tickets" on public.tickets for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('event_organizer', 'admin', 'super_admin', 'volunteer'))
);

-- ATTENDANCE
create policy "Allow checked-in users to read attendance" on public.attendance for select using (
    exists (
        select 1 from public.tickets t
        join public.registrations r on r.id = t.registration_id
        where t.id = ticket_id and (r.student_id = auth.uid() or exists (
            select 1 from public.profiles where id = auth.uid() and role in ('event_organizer', 'admin', 'super_admin', 'volunteer')
        ))
    )
);
create policy "Allow organizers/volunteers to check in" on public.attendance for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('event_organizer', 'admin', 'super_admin', 'volunteer'))
);

-- PAYMENTS
create policy "Allow users to read their own payments" on public.payments for select using (
    exists (
        select 1 from public.registrations r 
        where r.id = registration_id and r.student_id = auth.uid()
    ) or exists (
        select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin')
    )
);
create policy "Allow admins to manage payments" on public.payments for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);

-- REFUNDS
create policy "Allow users to read their own refunds" on public.refunds for select using (
    exists (
        select 1 from public.payments p
        join public.registrations r on r.id = p.registration_id
        where p.id = payment_id and r.student_id = auth.uid()
    ) or exists (
        select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin')
    )
);
create policy "Allow admins to manage refunds" on public.refunds for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);

-- SETTLEMENTS
create policy "Allow admins to view settlements" on public.settlements for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);

-- CERTIFICATES
create policy "Allow public verification of certificates" on public.certificates for select using (true);
create policy "Allow organizers/admins to manage certificates" on public.certificates for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('event_organizer', 'admin', 'super_admin'))
);

-- NOTIFICATIONS
create policy "Allow users to manage their own notifications" on public.notifications for all using (user_id = auth.uid());

-- ACTIVITY_LOGS
create policy "Allow admins to view activity logs" on public.activity_logs for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);

-- VOLUNTEERS
create policy "Allow users to view volunteers" on public.volunteers for select using (true);
create policy "Allow organizers/admins to manage volunteers" on public.volunteers for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('event_organizer', 'admin', 'super_admin'))
);


----------------- INDEXES FOR PERFORMANCE -----------------
create index idx_profiles_role on public.profiles(role);
create index idx_events_status on public.events(status);
create index idx_events_date_time on public.events(date_time);
create index idx_registrations_event_student on public.registrations(event_id, student_id);
create index idx_registrations_status on public.registrations(status);
create index idx_tickets_registration_id on public.tickets(registration_id);
create index idx_tickets_ticket_id on public.tickets(ticket_id);
create index idx_attendance_ticket_id on public.attendance(ticket_id);
create index idx_payments_registration_id on public.payments(registration_id);
create index idx_payments_order_id on public.payments(order_id);
create index idx_refunds_payment_id on public.refunds(payment_id);
create index idx_certificates_registration_id on public.certificates(registration_id);
create index idx_certificates_certificate_id on public.certificates(certificate_id);
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_is_read on public.notifications(is_read);
create index idx_volunteers_event_user on public.volunteers(event_id, user_id);

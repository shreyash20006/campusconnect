-- Phase 2 Database Schema Enhancements
-- Target: Supabase / PostgreSQL

-- 1. Extend Events Table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS visibility text not null default 'public' check (visibility in ('public', 'college', 'department', 'club'));
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS approval_required boolean not null default false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_template boolean not null default false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS gallery jsonb not null default '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS organizers jsonb not null default '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS waitlist_limit integer default 0;

-- 2. Extend Registrations Table status check
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_status_check;
ALTER TABLE public.registrations ADD CONSTRAINT registrations_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'waitlisted'));

-- 3. Create Volunteer Applications Table
CREATE TABLE IF NOT EXISTS public.volunteer_applications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    event_id uuid not null references public.events(id) on delete cascade,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    message text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    unique (user_id, event_id)
);

-- Enable RLS for volunteer applications
ALTER TABLE public.volunteer_applications enable row level security;

-- Policies for volunteer applications
CREATE POLICY "Allow users to read their own volunteer applications" ON public.volunteer_applications FOR SELECT USING (
    user_id = auth.uid() OR exists (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('event_organizer', 'admin', 'super_admin')
    )
);
CREATE POLICY "Allow users to insert their own applications" ON public.volunteer_applications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Allow organizers/admins to manage volunteer applications" ON public.volunteer_applications FOR ALL USING (
    exists (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('event_organizer', 'admin', 'super_admin'))
);

-- 4. Create Volunteer Shifts Table
CREATE TABLE IF NOT EXISTS public.volunteer_shifts (
    id uuid primary key default gen_random_uuid(),
    volunteer_id uuid not null references public.volunteers(id) on delete cascade,
    role_assigned text not null,
    start_time timestamp with time zone not null,
    end_time timestamp with time zone not null,
    status text not null default 'scheduled' check (status in ('scheduled', 'checked_in', 'completed', 'missed')),
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS for shifts
ALTER TABLE public.volunteer_shifts enable row level security;

-- Policies for shifts
CREATE POLICY "Allow users to view volunteer shifts" ON public.volunteer_shifts FOR SELECT USING (true);
CREATE POLICY "Allow organizers/admins to manage volunteer shifts" ON public.volunteer_shifts FOR ALL USING (
    exists (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('event_organizer', 'admin', 'super_admin'))
);

-- 5. Create Certificate Templates Table
CREATE TABLE IF NOT EXISTS public.certificate_templates (
    id uuid primary key default gen_random_uuid(),
    event_id uuid references public.events(id) on delete set null,
    name text not null,
    design_json jsonb not null default '{}'::jsonb,
    college_logo_url text,
    signature_url text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS for certificate templates
ALTER TABLE public.certificate_templates enable row level security;

-- Policies for certificate templates
CREATE POLICY "Allow anyone to read certificate templates" ON public.certificate_templates FOR SELECT USING (true);
CREATE POLICY "Allow organizers/admins to manage templates" ON public.certificate_templates FOR ALL USING (
    exists (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('event_organizer', 'admin', 'super_admin'))
);

-- 6. Create Notices Table
CREATE TABLE IF NOT EXISTS public.notices (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    content text not null,
    club_id uuid references public.clubs(id) on delete cascade,
    department text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS for notices
ALTER TABLE public.notices enable row level security;

-- Policies for notices
CREATE POLICY "Allow public read access to notices" ON public.notices FOR SELECT USING (true);
CREATE POLICY "Allow organizers/admins to manage notices" ON public.notices FOR ALL USING (
    exists (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('event_organizer', 'admin', 'super_admin'))
);

-- 7. Add update triggers
CREATE TRIGGER update_volunteer_applications_updated_at BEFORE UPDATE ON public.volunteer_applications FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_volunteer_shifts_updated_at BEFORE UPDATE ON public.volunteer_shifts FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_certificate_templates_updated_at BEFORE UPDATE ON public.certificate_templates FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON public.notices FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_volunteer_apps_user ON public.volunteer_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_apps_event ON public.volunteer_applications(event_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_vol ON public.volunteer_shifts(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_certificate_templates_event ON public.certificate_templates(event_id);
CREATE INDEX IF NOT EXISTS idx_notices_club ON public.notices(club_id);

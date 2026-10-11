-- ==============================================================================
-- AGENTBLAZER — Supabase PostgreSQL Database Schema
-- Amrita Vishwa Vidyapeetham, Amaravati
-- ==============================================================================
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- ==============================================================================

-- 1. Create registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    registration_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    college_email TEXT NOT NULL,
    personal_email TEXT,
    contact_number TEXT NOT NULL,
    whatsapp_number TEXT,
    year TEXT NOT NULL,
    branch TEXT NOT NULL,
    section TEXT DEFAULT 'N/A',
    interests TEXT[] DEFAULT '{}'::TEXT[],
    motivation TEXT,
    ai_agent_idea TEXT,
    status TEXT DEFAULT 'Under Review' NOT NULL
);

-- 2. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_registrations_reg_id ON public.registrations(registration_id);
CREATE INDEX IF NOT EXISTS idx_registrations_college_email ON public.registrations(college_email);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON public.registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_year ON public.registrations(year);
CREATE INDEX IF NOT EXISTS idx_registrations_branch ON public.registrations(branch);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 4. Policies:
-- Allow anyone (including anon / unauthenticated public students) to insert new registrations
CREATE POLICY "Allow public registration insert"
    ON public.registrations
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow public / anon to read registrations (needed for client portal / verification)
CREATE POLICY "Allow public read access"
    ON public.registrations
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow updating student status & details (for Admin Portal)
CREATE POLICY "Allow update access"
    ON public.registrations
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Allow deletion of registrations (for Admin Portal)
CREATE POLICY "Allow delete access"
    ON public.registrations
    FOR DELETE
    TO anon, authenticated
    USING (true);

-- ==============================================================================
-- Optional Seed Sample Data for Testing (Uncomment to test)
-- ==============================================================================
/*
INSERT INTO public.registrations (
    registration_id, full_name, college_email, personal_email,
    contact_number, whatsapp_number, year, branch, section,
    interests, motivation, ai_agent_idea, status
) VALUES 
(
    'AB-AMR-1042', 'Aarav Sharma', 'aarav.cse@am.students.amrita.edu', 'aarav.sharma@gmail.com',
    '9876543210', '9876543210', 'Third Year', 'CSE', 'A',
    ARRAY['AI & AGENTIC AI', 'AGENTFORCE', 'CLOUD'],
    'Deep interest in building autonomous multi-agent systems and contributing to university research labs.',
    'An automated lab equipment reservation and fault-reporting AI agent for campus research facilities.',
    'Selected'
),
(
    'AB-AMR-2085', 'Diya Reddy', 'diya.ai@am.students.amrita.edu', 'diya.reddy04@gmail.com',
    '9845123456', '9845123456', 'Second Year', 'AI', 'B',
    ARRAY['AI & AGENTIC AI', 'DATA & ANALYTICS', 'RESEARCH'],
    'Eager to explore the Agentforce Champions Journey and participate in national hackathons.',
    'A conversational campus calendar agent that keeps students updated on exam timetables.',
    'Selected'
),
(
    'AB-AMR-3096', 'Rohan Varma', 'rohan.ece@am.students.amrita.edu', 'rohan.varma24@gmail.com',
    '9123456780', '9123456780', 'First Year', 'ECE', 'N/A',
    ARRAY['SOFTWARE DEVELOPMENT', 'WEB DEVELOPMENT', 'CYBERSECURITY'],
    'Curious about intelligent IoT agents and cross-disciplinary hardware-software integration.',
    'An energy monitoring agent that detects idle electrical equipment across university labs.',
    'Under Review'
)
ON CONFLICT (registration_id) DO NOTHING;
*/

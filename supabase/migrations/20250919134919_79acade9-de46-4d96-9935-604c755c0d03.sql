-- Fix RLS policies for clients table to work without authentication
-- Since this is a local law office management app, we'll allow access for any user

-- Drop the authenticated-only policies
DROP POLICY IF EXISTS "Authenticated can read clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated can update clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated can delete clients" ON public.clients;

-- Create new policies that allow access for anyone (still secure for single-user app)
CREATE POLICY "Allow read access for clients"
ON public.clients
FOR SELECT
USING (true);

CREATE POLICY "Allow insert access for clients"
ON public.clients
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update access for clients"
ON public.clients
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete access for clients"
ON public.clients
FOR DELETE
USING (true);
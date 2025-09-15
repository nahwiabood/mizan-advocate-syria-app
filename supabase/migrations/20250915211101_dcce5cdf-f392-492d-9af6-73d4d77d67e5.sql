-- Secure PII in public.clients by restricting access to authenticated users only
-- 1) Ensure RLS is enabled
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 2) Remove overly permissive policy
DROP POLICY IF EXISTS "Allow all operations for clients" ON public.clients;

-- 3) Create least-privilege policies for authenticated users
CREATE POLICY "Authenticated can read clients"
ON public.clients
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update clients"
ON public.clients
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated can delete clients"
ON public.clients
FOR DELETE
TO authenticated
USING (true);
-- Drop existing overly permissive policies for clients table
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.clients;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.clients;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.clients;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.clients;
DROP POLICY IF EXISTS "Enable update for all users" ON public.clients;

-- Create secure RLS policies that require authentication
CREATE POLICY "Authenticated users can select clients" 
ON public.clients 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert clients" 
ON public.clients 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients" 
ON public.clients 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete clients" 
ON public.clients 
FOR DELETE 
TO authenticated 
USING (true);
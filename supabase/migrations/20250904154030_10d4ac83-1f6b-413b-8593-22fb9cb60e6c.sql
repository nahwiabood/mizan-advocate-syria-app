-- Drop existing overly permissive policies for clients table
DROP POLICY IF EXISTS "Authenticated users can delete clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;  
DROP POLICY IF EXISTS "Authenticated users can select clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clients;

-- Create secure RLS policies for clients table (admin access only)
CREATE POLICY "Admin users can manage clients" 
ON public.clients 
FOR ALL 
TO authenticated 
USING (is_admin_user()) 
WITH CHECK (is_admin_user());
-- Fix RLS policies by dropping all existing restrictive policies first
-- Then create permissive policies for law office application

-- Drop all existing policies for clients table
DROP POLICY IF EXISTS "Enable all operations for clients" ON public.clients;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.clients;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.clients;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.clients;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.clients;
DROP POLICY IF EXISTS "Enable update for all users" ON public.clients;

-- Create new permissive policy for clients
CREATE POLICY "Allow all operations for clients" 
ON public.clients 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Drop all existing policies for financial tables
DROP POLICY IF EXISTS "Enable all operations for client fees" ON public.client_fees;
DROP POLICY IF EXISTS "Enable all operations for client payments" ON public.client_payments;
DROP POLICY IF EXISTS "Enable all operations for client expenses" ON public.client_expenses;
DROP POLICY IF EXISTS "Enable all operations for case fees" ON public.case_fees;
DROP POLICY IF EXISTS "Enable all operations for case payments" ON public.case_payments;
DROP POLICY IF EXISTS "Enable all operations for case expenses" ON public.case_expenses;
DROP POLICY IF EXISTS "Enable all operations for office income" ON public.office_income;
DROP POLICY IF EXISTS "Enable all operations for office expenses" ON public.office_expenses;

-- Create new permissive policies for financial tables
CREATE POLICY "Allow all operations for client fees" 
ON public.client_fees 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations for client payments" 
ON public.client_payments 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations for client expenses" 
ON public.client_expenses 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations for case fees" 
ON public.case_fees 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations for case payments" 
ON public.case_payments 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations for case expenses" 
ON public.case_expenses 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations for office income" 
ON public.office_income 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations for office expenses" 
ON public.office_expenses 
FOR ALL 
USING (true) 
WITH CHECK (true);
-- Drop existing overly permissive policies for financial tables
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.client_payments;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.client_payments;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.client_payments;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.client_payments;
DROP POLICY IF EXISTS "Enable update for all users" ON public.client_payments;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.client_fees;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.client_fees;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.client_fees;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.client_fees;
DROP POLICY IF EXISTS "Enable update for all users" ON public.client_fees;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.client_expenses;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.client_expenses;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.client_expenses;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.client_expenses;
DROP POLICY IF EXISTS "Enable update for all users" ON public.client_expenses;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.case_fees;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.case_payments;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.case_expenses;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.office_income;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.office_income;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.office_income;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.office_income;
DROP POLICY IF EXISTS "Enable update for all users" ON public.office_income;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.office_expenses;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.office_expenses;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.office_expenses;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.office_expenses;
DROP POLICY IF EXISTS "Enable update for all users" ON public.office_expenses;

-- Create secure RLS policies for client_payments (admin access only)
CREATE POLICY "Admin users can manage client payments" 
ON public.client_payments 
FOR ALL 
TO authenticated 
USING (is_admin_user()) 
WITH CHECK (is_admin_user());

-- Create secure RLS policies for client_fees (admin access only)
CREATE POLICY "Admin users can manage client fees" 
ON public.client_fees 
FOR ALL 
TO authenticated 
USING (is_admin_user()) 
WITH CHECK (is_admin_user());

-- Create secure RLS policies for client_expenses (admin access only)
CREATE POLICY "Admin users can manage client expenses" 
ON public.client_expenses 
FOR ALL 
TO authenticated 
USING (is_admin_user()) 
WITH CHECK (is_admin_user());

-- Create secure RLS policies for case_fees (admin access only)
CREATE POLICY "Admin users can manage case fees" 
ON public.case_fees 
FOR ALL 
TO authenticated 
USING (is_admin_user()) 
WITH CHECK (is_admin_user());

-- Create secure RLS policies for case_payments (admin access only)
CREATE POLICY "Admin users can manage case payments" 
ON public.case_payments 
FOR ALL 
TO authenticated 
USING (is_admin_user()) 
WITH CHECK (is_admin_user());

-- Create secure RLS policies for case_expenses (admin access only)
CREATE POLICY "Admin users can manage case expenses" 
ON public.case_expenses 
FOR ALL 
TO authenticated 
USING (is_admin_user()) 
WITH CHECK (is_admin_user());

-- Create secure RLS policies for office_income (admin access only)
CREATE POLICY "Admin users can manage office income" 
ON public.office_income 
FOR ALL 
TO authenticated 
USING (is_admin_user()) 
WITH CHECK (is_admin_user());

-- Create secure RLS policies for office_expenses (admin access only)
CREATE POLICY "Admin users can manage office expenses" 
ON public.office_expenses 
FOR ALL 
TO authenticated 
USING (is_admin_user()) 
WITH CHECK (is_admin_user());
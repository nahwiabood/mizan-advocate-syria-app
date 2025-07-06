
-- Create table for client fees
CREATE TABLE public.client_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  fee_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE
);

-- Create table for client payments
CREATE TABLE public.client_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE
);

-- Create table for client expenses
CREATE TABLE public.client_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE
);

-- Create table for general office income
CREATE TABLE public.office_income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  income_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT DEFAULT 'أخرى',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for general office expenses
CREATE TABLE public.office_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT DEFAULT 'أخرى',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.client_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_expenses ENABLE ROW LEVEL SECURITY;

-- Policies for client_fees
CREATE POLICY "Enable all operations for authenticated users" ON public.client_fees FOR ALL USING (true);

-- Policies for client_payments
CREATE POLICY "Enable all operations for authenticated users" ON public.client_payments FOR ALL USING (true);

-- Policies for client_expenses
CREATE POLICY "Enable all operations for authenticated users" ON public.client_expenses FOR ALL USING (true);

-- Policies for office_income
CREATE POLICY "Enable all operations for authenticated users" ON public.office_income FOR ALL USING (true);

-- Policies for office_expenses
CREATE POLICY "Enable all operations for authenticated users" ON public.office_expenses FOR ALL USING (true);

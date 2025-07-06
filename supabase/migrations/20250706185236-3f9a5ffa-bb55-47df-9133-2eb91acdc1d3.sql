
-- Create table for case fees
CREATE TABLE public.case_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  fee_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for case payments
CREATE TABLE public.case_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for case expenses
CREATE TABLE public.case_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for case accounting tables
ALTER TABLE public.case_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_expenses ENABLE ROW LEVEL SECURITY;

-- Policies for case_fees
CREATE POLICY "Enable all operations for authenticated users" ON public.case_fees FOR ALL USING (true);

-- Policies for case_payments
CREATE POLICY "Enable all operations for authenticated users" ON public.case_payments FOR ALL USING (true);

-- Policies for case_expenses
CREATE POLICY "Enable all operations for authenticated users" ON public.case_expenses FOR ALL USING (true);

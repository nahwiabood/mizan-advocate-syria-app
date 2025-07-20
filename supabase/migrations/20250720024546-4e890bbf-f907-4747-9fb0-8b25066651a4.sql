
-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cases table
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  case_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case_stages table
CREATE TABLE public.case_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  court_name TEXT NOT NULL,
  first_session_date DATE,
  resolution_date DATE,
  resolution_details TEXT,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id UUID REFERENCES public.case_stages(id) ON DELETE CASCADE,
  court_name TEXT NOT NULL,
  case_number TEXT NOT NULL,
  session_date DATE NOT NULL,
  client_name TEXT NOT NULL,
  opponent TEXT,
  postponement_reason TEXT,
  next_session_date DATE,
  next_postponement_reason TEXT,
  is_transferred BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolution_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'medium',
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  appointment_date DATE NOT NULL,
  time TIME,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_expenses ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for everyone (public access)
CREATE POLICY "Enable all operations for everyone" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON public.cases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON public.case_stages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON public.sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON public.client_fees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON public.client_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON public.client_expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON public.office_income FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON public.office_expenses FOR ALL USING (true) WITH CHECK (true);

-- Add triggers for updating updated_at timestamps
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_case_stages_updated_at BEFORE UPDATE ON public.case_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- إنشاء جدول العملاء
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

-- إنشاء جدول القضايا
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

-- إنشاء جدول مراحل القضايا
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

-- إنشاء جدول الجلسات
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

-- إنشاء جدول المهام
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول المواعيد
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

-- إنشاء جدول أتعاب العملاء
CREATE TABLE public.client_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  fee_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول مدفوعات العملاء
CREATE TABLE public.client_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول مصاريف العملاء
CREATE TABLE public.client_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول إيرادات المكتب
CREATE TABLE public.office_income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  income_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول مصاريف المكتب
CREATE TABLE public.office_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل Row Level Security على جميع الجداول
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

-- إنشاء سياسات للوصول العام للقراءة (بما أن المطلوب إمكانية الوصول من أي متصفح)
CREATE POLICY "Enable read access for all users" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.clients FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.cases FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.cases FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.case_stages FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.case_stages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.case_stages FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.case_stages FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.sessions FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.sessions FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.tasks FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.appointments FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.appointments FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.client_fees FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.client_fees FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.client_fees FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.client_fees FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.client_payments FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.client_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.client_payments FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.client_payments FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.client_expenses FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.client_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.client_expenses FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.client_expenses FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.office_income FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.office_income FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.office_income FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.office_income FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.office_expenses FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.office_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.office_expenses FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.office_expenses FOR DELETE USING (true);

-- تفعيل التحديثات الفورية للمهام
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.tasks;

-- تفعيل التحديثات الفورية للجلسات والمواعيد
ALTER TABLE public.sessions REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.sessions;

ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.appointments;

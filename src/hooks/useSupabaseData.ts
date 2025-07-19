
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Client, 
  Case, 
  CaseStage, 
  Session, 
  Task, 
  Appointment, 
  ClientFee, 
  ClientPayment, 
  ClientExpense, 
  OfficeIncome, 
  OfficeExpense 
} from '@/types';

export const useSupabaseData = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [stages, setStages] = useState<CaseStage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clientFees, setClientFees] = useState<ClientFee[]>([]);
  const [clientPayments, setClientPayments] = useState<ClientPayment[]>([]);
  const [clientExpenses, setClientExpenses] = useState<ClientExpense[]>([]);
  const [officeIncome, setOfficeIncome] = useState<OfficeIncome[]>([]);
  const [officeExpenses, setOfficeExpenses] = useState<OfficeExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [
        clientsRes,
        casesRes,
        stagesRes,
        sessionsRes,
        tasksRes,
        appointmentsRes,
        feesRes,
        paymentsRes,
        expensesRes,
        incomeRes,
        officeExpRes
      ] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('cases').select('*').order('created_at', { ascending: false }),
        supabase.from('case_stages').select('*').order('created_at', { ascending: false }),
        supabase.from('sessions').select('*').order('session_date', { ascending: true }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('appointments').select('*').order('appointment_date', { ascending: true }),
        supabase.from('client_fees').select('*').order('fee_date', { ascending: false }),
        supabase.from('client_payments').select('*').order('payment_date', { ascending: false }),
        supabase.from('client_expenses').select('*').order('expense_date', { ascending: false }),
        supabase.from('office_income').select('*').order('income_date', { ascending: false }),
        supabase.from('office_expenses').select('*').order('expense_date', { ascending: false })
      ]);

      if (clientsRes.data) setClients(clientsRes.data);
      if (casesRes.data) setCases(casesRes.data);
      if (stagesRes.data) setStages(stagesRes.data);
      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (tasksRes.data) setTasks(tasksRes.data);
      if (appointmentsRes.data) setAppointments(appointmentsRes.data);
      if (feesRes.data) setClientFees(feesRes.data);
      if (paymentsRes.data) setClientPayments(paymentsRes.data);
      if (expensesRes.data) setClientExpenses(expensesRes.data);
      if (incomeRes.data) setOfficeIncome(incomeRes.data);
      if (officeExpRes.data) setOfficeExpenses(officeExpRes.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    clients,
    cases,
    stages,
    sessions,
    tasks,
    appointments,
    clientFees,
    clientPayments,
    clientExpenses,
    officeIncome,
    officeExpenses,
    loading,
    refetch: fetchAllData
  };
};

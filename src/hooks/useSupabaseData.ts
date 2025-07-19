
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, Appointment, Session, Client, Case, CaseStage, ClientFee, ClientPayment, ClientExpense, OfficeIncome, OfficeExpense } from '@/types';

export const useSupabaseData = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [stages, setStages] = useState<CaseStage[]>([]);
  const [clientFees, setClientFees] = useState<ClientFee[]>([]);
  const [clientPayments, setClientPayments] = useState<ClientPayment[]>([]);
  const [clientExpenses, setClientExpenses] = useState<ClientExpense[]>([]);
  const [officeIncome, setOfficeIncome] = useState<OfficeIncome[]>([]);
  const [officeExpenses, setOfficeExpenses] = useState<OfficeExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        tasksData,
        appointmentsData,
        sessionsData,
        clientsData,
        casesData,
        stagesData,
        feesData,
        paymentsData,
        expensesData,
        incomeData,
        officeExpensesData
      ] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('appointments').select('*').order('created_at', { ascending: false }),
        supabase.from('sessions').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('cases').select('*').order('created_at', { ascending: false }),
        supabase.from('case_stages').select('*').order('created_at', { ascending: false }),
        supabase.from('client_fees').select('*').order('created_at', { ascending: false }),
        supabase.from('client_payments').select('*').order('created_at', { ascending: false }),
        supabase.from('client_expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('office_income').select('*').order('created_at', { ascending: false }),
        supabase.from('office_expenses').select('*').order('created_at', { ascending: false })
      ]);

      if (tasksData.data) setTasks(tasksData.data.map(convertDates));
      if (appointmentsData.data) setAppointments(appointmentsData.data.map(convertDates));
      if (sessionsData.data) setSessions(sessionsData.data.map(convertDates));
      if (clientsData.data) setClients(clientsData.data.map(convertDates));
      if (casesData.data) setCases(casesData.data.map(convertDates));
      if (stagesData.data) setStages(stagesData.data.map(convertDates));
      if (feesData.data) setClientFees(feesData.data.map(convertDates));
      if (paymentsData.data) setClientPayments(paymentsData.data.map(convertDates));
      if (expensesData.data) setClientExpenses(expensesData.data.map(convertDates));
      if (incomeData.data) setOfficeIncome(incomeData.data.map(convertDates));
      if (officeExpensesData.data) setOfficeExpenses(officeExpensesData.data.map(convertDates));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const convertDates = (item: any) => {
    const converted = { ...item };
    
    // Convert date strings to Date objects
    if (converted.created_at) converted.createdAt = new Date(converted.created_at);
    if (converted.updated_at) converted.updatedAt = new Date(converted.updated_at);
    if (converted.due_date) converted.dueDate = new Date(converted.due_date);
    if (converted.completed_at) converted.completedAt = new Date(converted.completed_at);
    if (converted.appointment_date) converted.appointmentDate = new Date(converted.appointment_date);
    if (converted.session_date) converted.sessionDate = new Date(converted.session_date);
    if (converted.next_session_date) converted.nextSessionDate = new Date(converted.next_session_date);
    if (converted.resolution_date) converted.resolutionDate = new Date(converted.resolution_date);
    if (converted.first_session_date) converted.firstSessionDate = new Date(converted.first_session_date);
    if (converted.fee_date) converted.feeDate = new Date(converted.fee_date);
    if (converted.payment_date) converted.paymentDate = new Date(converted.payment_date);
    if (converted.expense_date) converted.expenseDate = new Date(converted.expense_date);
    if (converted.income_date) converted.incomeDate = new Date(converted.income_date);

    // Convert snake_case to camelCase
    if (converted.is_completed !== undefined) converted.isCompleted = converted.is_completed;
    if (converted.is_transferred !== undefined) converted.isTransferred = converted.is_transferred;
    if (converted.is_resolved !== undefined) converted.isResolved = converted.is_resolved;
    if (converted.client_id) converted.clientId = converted.client_id;
    if (converted.case_id) converted.caseId = converted.case_id;
    if (converted.stage_id) converted.stageId = converted.stage_id;
    if (converted.court_name) converted.courtName = converted.court_name;
    if (converted.case_number) converted.caseNumber = converted.case_number;
    if (converted.client_name) converted.clientName = converted.client_name;
    if (converted.postponement_reason) converted.postponementReason = converted.postponement_reason;
    if (converted.next_postponement_reason) converted.nextPostponementReason = converted.next_postponement_reason;
    if (converted.stage_name) converted.stageName = converted.stage_name;

    return converted;
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    tasks,
    appointments,
    sessions,
    clients,
    cases,
    stages,
    clientFees,
    clientPayments,
    clientExpenses,
    officeIncome,
    officeExpenses,
    isLoading,
    refetch: fetchData
  };
};

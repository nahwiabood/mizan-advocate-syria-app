
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

export const supabaseStore = {
  // Client operations
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert([{
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address,
        notes: client.notes
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update({
        name: updates.name,
        phone: updates.phone,
        email: updates.email,
        address: updates.address,
        notes: updates.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Case operations
  async getCases(): Promise<Case[]> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addCase(case_: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Promise<Case> {
    const { data, error } = await supabase
      .from('cases')
      .insert([{
        client_id: case_.clientId,
        case_number: `CASE-${Date.now()}`,
        title: case_.title,
        description: case_.description,
        status: case_.status || 'active'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCase(id: string, updates: Partial<Case>): Promise<Case> {
    const { data, error } = await supabase
      .from('cases')
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Stage operations
  async getStages(): Promise<CaseStage[]> {
    const { data, error } = await supabase
      .from('case_stages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addStage(stage: Omit<CaseStage, 'id' | 'createdAt' | 'updatedAt'>): Promise<CaseStage> {
    const { data, error } = await supabase
      .from('case_stages')
      .insert([{
        case_id: stage.caseId,
        stage_name: stage.stageName,
        court_name: stage.courtName,
        first_session_date: stage.firstSessionDate,
        resolution_date: stage.resolutionDate,
        is_resolved: stage.isResolved || false
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateStage(id: string, updates: Partial<CaseStage>): Promise<CaseStage> {
    const { data, error } = await supabase
      .from('case_stages')
      .update({
        stage_name: updates.stageName,
        court_name: updates.courtName,
        first_session_date: updates.firstSessionDate,
        resolution_date: updates.resolutionDate,
        is_resolved: updates.isResolved,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Session operations
  async getSessions(): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('session_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addSession(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .insert([{
        stage_id: session.stageId,
        court_name: session.courtName,
        case_number: session.caseNumber,
        session_date: session.sessionDate,
        client_name: session.clientName,
        opponent: session.opponent,
        postponement_reason: session.postponementReason,
        next_session_date: session.nextSessionDate,
        next_postponement_reason: session.nextPostponementReason,
        is_transferred: session.isTransferred || false,
        is_resolved: session.isResolved || false,
        resolution_date: session.resolutionDate
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Task operations
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title: task.title,
        description: task.description,
        due_date: task.dueDate,
        priority: task.priority || 'medium',
        is_completed: task.isCompleted || false,
        completed_at: task.completedAt
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description,
        due_date: updates.dueDate,
        priority: updates.priority,
        is_completed: updates.isCompleted,
        completed_at: updates.completedAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Appointment operations
  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        title: appointment.title,
        description: appointment.description,
        appointment_date: appointment.appointmentDate,
        time: appointment.time,
        location: appointment.location
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        title: updates.title,
        description: updates.description,
        appointment_date: updates.appointmentDate,
        time: updates.time,
        location: updates.location,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Client accounting operations
  async getClientFees(clientId: string): Promise<ClientFee[]> {
    const { data, error } = await supabase
      .from('client_fees')
      .select('*')
      .eq('client_id', clientId)
      .order('fee_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addClientFee(fee: Omit<ClientFee, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientFee> {
    const { data, error } = await supabase
      .from('client_fees')
      .insert([{
        client_id: fee.clientId,
        amount: fee.amount,
        fee_date: fee.feeDate,
        description: fee.description
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getClientPayments(clientId: string): Promise<ClientPayment[]> {
    const { data, error } = await supabase
      .from('client_payments')
      .select('*')
      .eq('client_id', clientId)
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addClientPayment(payment: Omit<ClientPayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientPayment> {
    const { data, error } = await supabase
      .from('client_payments')
      .insert([{
        client_id: payment.clientId,
        amount: payment.amount,
        payment_date: payment.paymentDate,
        description: payment.description
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getClientExpenses(clientId: string): Promise<ClientExpense[]> {
    const { data, error } = await supabase
      .from('client_expenses')
      .select('*')
      .eq('client_id', clientId)
      .order('expense_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addClientExpense(expense: Omit<ClientExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientExpense> {
    const { data, error } = await supabase
      .from('client_expenses')
      .insert([{
        client_id: expense.clientId,
        amount: expense.amount,
        expense_date: expense.expenseDate,
        description: expense.description
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Calculate client balance
  async getClientBalance(clientId: string) {
    try {
      const [fees, payments, expenses] = await Promise.all([
        this.getClientFees(clientId),
        this.getClientPayments(clientId),
        this.getClientExpenses(clientId)
      ]);

      const totalFees = fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
      const totalPayments = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const balance = totalFees - totalPayments + totalExpenses;

      return {
        totalFees,
        totalPayments,
        totalExpenses,
        balance
      };
    } catch (error) {
      console.error('Error calculating client balance:', error);
      return {
        totalFees: 0,
        totalPayments: 0,
        totalExpenses: 0,
        balance: 0
      };
    }
  },

  // Office accounting operations
  async getOfficeIncome(): Promise<OfficeIncome[]> {
    const { data, error } = await supabase
      .from('office_income')
      .select('*')
      .order('income_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addOfficeIncome(income: Omit<OfficeIncome, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeIncome> {
    const { data, error } = await supabase
      .from('office_income')
      .insert([{
        amount: income.amount,
        income_date: income.incomeDate,
        description: income.description,
        source: income.source
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getOfficeExpenses(): Promise<OfficeExpense[]> {
    const { data, error } = await supabase
      .from('office_expenses')
      .select('*')
      .order('expense_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addOfficeExpense(expense: Omit<OfficeExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeExpense> {
    const { data, error } = await supabase
      .from('office_expenses')
      .insert([{
        amount: expense.amount,
        expense_date: expense.expenseDate,
        description: expense.description,
        category: expense.category
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

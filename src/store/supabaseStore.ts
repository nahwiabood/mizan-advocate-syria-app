
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
  OfficeExpense,
  ClientBalance 
} from '@/types';

class SupabaseStore {
  
  // Clients
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async addClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address,
        notes: client.notes
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteClient(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Cases
  async getCases(): Promise<Case[]> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async addCase(case_: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Promise<Case> {
    const { data, error } = await supabase
      .from('cases')
      .insert({
        client_id: case_.clientId,
        title: case_.title,
        description: case_.description,
        opponent: case_.opponent,
        subject: case_.subject,
        case_type: case_.caseType,
        status: case_.status
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      clientId: data.client_id,
      caseType: data.case_type
    };
  }

  async updateCase(id: string, updates: Partial<Case>): Promise<Case> {
    const dbUpdates: any = {};
    if (updates.clientId) dbUpdates.client_id = updates.clientId;
    if (updates.caseType) dbUpdates.case_type = updates.caseType;
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.opponent) dbUpdates.opponent = updates.opponent;
    if (updates.subject) dbUpdates.subject = updates.subject;
    if (updates.status) dbUpdates.status = updates.status;

    const { data, error } = await supabase
      .from('cases')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      clientId: data.client_id,
      caseType: data.case_type
    };
  }

  async deleteCase(id: string): Promise<void> {
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Case Stages
  async getStages(): Promise<CaseStage[]> {
    const { data, error } = await supabase
      .from('case_stages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(stage => ({
      ...stage,
      caseId: stage.case_id,
      courtName: stage.court_name,
      caseNumber: stage.case_number,
      stageName: stage.stage_name,
      firstSessionDate: new Date(stage.first_session_date),
      isResolved: stage.is_resolved,
      resolutionDate: stage.resolution_date ? new Date(stage.resolution_date) : undefined,
      decisionNumber: stage.resolution_details,
      createdAt: new Date(stage.created_at),
      updatedAt: new Date(stage.updated_at)
    }));
  }

  async addStage(stage: Omit<CaseStage, 'id' | 'createdAt' | 'updatedAt'>): Promise<CaseStage> {
    const { data, error } = await supabase
      .from('case_stages')
      .insert({
        case_id: stage.caseId,
        court_name: stage.courtName,
        case_number: stage.caseNumber,
        stage_name: stage.stageName,
        first_session_date: stage.firstSessionDate,
        status: stage.status,
        notes: stage.notes,
        is_resolved: stage.isResolved || false,
        resolution_date: stage.resolutionDate,
        resolution_details: stage.decisionNumber
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      caseId: data.case_id,
      courtName: data.court_name,
      caseNumber: data.case_number,
      stageName: data.stage_name,
      firstSessionDate: new Date(data.first_session_date),
      isResolved: data.is_resolved,
      resolutionDate: data.resolution_date ? new Date(data.resolution_date) : undefined,
      decisionNumber: data.resolution_details,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateStage(id: string, updates: Partial<CaseStage>): Promise<CaseStage> {
    const dbUpdates: any = {};
    if (updates.caseId) dbUpdates.case_id = updates.caseId;
    if (updates.courtName) dbUpdates.court_name = updates.courtName;
    if (updates.caseNumber) dbUpdates.case_number = updates.caseNumber;
    if (updates.stageName) dbUpdates.stage_name = updates.stageName;
    if (updates.firstSessionDate) dbUpdates.first_session_date = updates.firstSessionDate;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.notes) dbUpdates.notes = updates.notes;
    if (updates.isResolved !== undefined) dbUpdates.is_resolved = updates.isResolved;
    if (updates.resolutionDate) dbUpdates.resolution_date = updates.resolutionDate;
    if (updates.decisionNumber) dbUpdates.resolution_details = updates.decisionNumber;

    const { data, error } = await supabase
      .from('case_stages')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      caseId: data.case_id,
      courtName: data.court_name,
      caseNumber: data.case_number,
      stageName: data.stage_name,
      firstSessionDate: new Date(data.first_session_date),
      isResolved: data.is_resolved,
      resolutionDate: data.resolution_date ? new Date(data.resolution_date) : undefined,
      decisionNumber: data.resolution_details,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteStage(id: string): Promise<void> {
    const { error } = await supabase
      .from('case_stages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Sessions
  async getSessions(): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('session_date', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(session => ({
      ...session,
      stageId: session.stage_id,
      courtName: session.court_name,
      caseNumber: session.case_number,
      sessionDate: new Date(session.session_date),
      clientName: session.client_name,
      postponementReason: session.postponement_reason,
      nextSessionDate: session.next_session_date ? new Date(session.next_session_date) : undefined,
      nextPostponementReason: session.next_postponement_reason,
      isTransferred: session.is_transferred,
      isResolved: session.is_resolved,
      resolutionDate: session.resolution_date ? new Date(session.resolution_date) : undefined,
      createdAt: new Date(session.created_at),
      updatedAt: new Date(session.updated_at)
    }));
  }

  async addSession(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
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
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      stageId: data.stage_id,
      courtName: data.court_name,
      caseNumber: data.case_number,
      sessionDate: new Date(data.session_date),
      clientName: data.client_name,
      postponementReason: data.postponement_reason,
      nextSessionDate: data.next_session_date ? new Date(data.next_session_date) : undefined,
      nextPostponementReason: data.next_postponement_reason,
      isTransferred: data.is_transferred,
      isResolved: data.is_resolved,
      resolutionDate: data.resolution_date ? new Date(data.resolution_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session> {
    const dbUpdates: any = {};
    if (updates.stageId) dbUpdates.stage_id = updates.stageId;
    if (updates.courtName) dbUpdates.court_name = updates.courtName;
    if (updates.caseNumber) dbUpdates.case_number = updates.caseNumber;
    if (updates.sessionDate) dbUpdates.session_date = updates.sessionDate;
    if (updates.clientName) dbUpdates.client_name = updates.clientName;
    if (updates.opponent) dbUpdates.opponent = updates.opponent;
    if (updates.postponementReason) dbUpdates.postponement_reason = updates.postponementReason;
    if (updates.nextSessionDate) dbUpdates.next_session_date = updates.nextSessionDate;
    if (updates.nextPostponementReason) dbUpdates.next_postponement_reason = updates.nextPostponementReason;
    if (updates.isTransferred !== undefined) dbUpdates.is_transferred = updates.isTransferred;
    if (updates.isResolved !== undefined) dbUpdates.is_resolved = updates.isResolved;
    if (updates.resolutionDate) dbUpdates.resolution_date = updates.resolutionDate;

    const { data, error } = await supabase
      .from('sessions')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      stageId: data.stage_id,
      courtName: data.court_name,
      caseNumber: data.case_number,
      sessionDate: new Date(data.session_date),
      clientName: data.client_name,
      postponementReason: data.postponement_reason,
      nextSessionDate: data.next_session_date ? new Date(data.next_session_date) : undefined,
      nextPostponementReason: data.next_postponement_reason,
      isTransferred: data.is_transferred,
      isResolved: data.is_resolved,
      resolutionDate: data.resolution_date ? new Date(data.resolution_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteSession(id: string): Promise<void> {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(task => ({
      ...task,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      isCompleted: task.is_completed,
      completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at)
    }));
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        due_date: task.dueDate,
        priority: task.priority,
        is_completed: task.isCompleted || false,
        completed_at: task.completedAt
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      isCompleted: data.is_completed,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
    if (updates.priority) dbUpdates.priority = updates.priority;
    if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted;
    if (updates.completedAt) dbUpdates.completed_at = updates.completedAt;

    const { data, error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      isCompleted: data.is_completed,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(appointment => ({
      ...appointment,
      appointmentDate: new Date(appointment.appointment_date),
      createdAt: new Date(appointment.created_at),
      updatedAt: new Date(appointment.updated_at),
      duration: 60 // Default duration as it's not in DB
    }));
  }

  async addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        title: appointment.title,
        description: appointment.description,
        appointment_date: appointment.appointmentDate,
        time: appointment.time,
        location: appointment.location
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      appointmentDate: new Date(data.appointment_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      duration: appointment.duration
    };
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.appointmentDate) dbUpdates.appointment_date = updates.appointmentDate;
    if (updates.time) dbUpdates.time = updates.time;
    if (updates.location) dbUpdates.location = updates.location;

    const { data, error } = await supabase
      .from('appointments')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      appointmentDate: new Date(data.appointment_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      duration: updates.duration || 60
    };
  }

  async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Client Fees
  async getClientFees(clientId?: string): Promise<ClientFee[]> {
    let query = supabase
      .from('client_fees')
      .select('*')
      .order('fee_date', { ascending: false });
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return (data || []).map(fee => ({
      ...fee,
      clientId: fee.client_id,
      feeDate: new Date(fee.fee_date),
      createdAt: new Date(fee.created_at),
      updatedAt: new Date(fee.updated_at)
    }));
  }

  async addClientFee(fee: Omit<ClientFee, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientFee> {
    const { data, error } = await supabase
      .from('client_fees')
      .insert({
        client_id: fee.clientId,
        description: fee.description,
        amount: fee.amount,
        fee_date: fee.feeDate
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      clientId: data.client_id,
      feeDate: new Date(data.fee_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateClientFee(id: string, updates: Partial<ClientFee>): Promise<ClientFee> {
    const dbUpdates: any = {};
    if (updates.clientId) dbUpdates.client_id = updates.clientId;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.amount) dbUpdates.amount = updates.amount;
    if (updates.feeDate) dbUpdates.fee_date = updates.feeDate;

    const { data, error } = await supabase
      .from('client_fees')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      clientId: data.client_id,
      feeDate: new Date(data.fee_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteClientFee(id: string): Promise<void> {
    const { error } = await supabase
      .from('client_fees')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Client Payments
  async getClientPayments(clientId?: string): Promise<ClientPayment[]> {
    let query = supabase
      .from('client_payments')
      .select('*')
      .order('payment_date', { ascending: false });
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return (data || []).map(payment => ({
      ...payment,
      clientId: payment.client_id,
      paymentDate: new Date(payment.payment_date),
      createdAt: new Date(payment.created_at),
      updatedAt: new Date(payment.updated_at)
    }));
  }

  async addClientPayment(payment: Omit<ClientPayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientPayment> {
    const { data, error } = await supabase
      .from('client_payments')
      .insert({
        client_id: payment.clientId,
        description: payment.description,
        amount: payment.amount,
        payment_date: payment.paymentDate
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      clientId: data.client_id,
      paymentDate: new Date(data.payment_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateClientPayment(id: string, updates: Partial<ClientPayment>): Promise<ClientPayment> {
    const dbUpdates: any = {};
    if (updates.clientId) dbUpdates.client_id = updates.clientId;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.amount) dbUpdates.amount = updates.amount;
    if (updates.paymentDate) dbUpdates.payment_date = updates.paymentDate;

    const { data, error } = await supabase
      .from('client_payments')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      clientId: data.client_id,
      paymentDate: new Date(data.payment_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteClientPayment(id: string): Promise<void> {
    const { error } = await supabase
      .from('client_payments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Client Expenses
  async getClientExpenses(clientId?: string): Promise<ClientExpense[]> {
    let query = supabase
      .from('client_expenses')
      .select('*')
      .order('expense_date', { ascending: false });
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return (data || []).map(expense => ({
      ...expense,
      clientId: expense.client_id,
      expenseDate: new Date(expense.expense_date),
      createdAt: new Date(expense.created_at),
      updatedAt: new Date(expense.updated_at)
    }));
  }

  async addClientExpense(expense: Omit<ClientExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientExpense> {
    const { data, error } = await supabase
      .from('client_expenses')
      .insert({
        client_id: expense.clientId,
        description: expense.description,
        amount: expense.amount,
        expense_date: expense.expenseDate
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      clientId: data.client_id,
      expenseDate: new Date(data.expense_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateClientExpense(id: string, updates: Partial<ClientExpense>): Promise<ClientExpense> {
    const dbUpdates: any = {};
    if (updates.clientId) dbUpdates.client_id = updates.clientId;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.amount) dbUpdates.amount = updates.amount;
    if (updates.expenseDate) dbUpdates.expense_date = updates.expenseDate;

    const { data, error } = await supabase
      .from('client_expenses')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      clientId: data.client_id,
      expenseDate: new Date(data.expense_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteClientExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from('client_expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Office Income
  async getOfficeIncome(): Promise<OfficeIncome[]> {
    const { data, error } = await supabase
      .from('office_income')
      .select('*')
      .order('income_date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(income => ({
      ...income,
      incomeDate: new Date(income.income_date),
      createdAt: new Date(income.created_at),
      updatedAt: new Date(income.updated_at)
    }));
  }

  async addOfficeIncome(income: Omit<OfficeIncome, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeIncome> {
    const { data, error } = await supabase
      .from('office_income')
      .insert({
        description: income.description,
        amount: income.amount,
        source: income.source,
        income_date: income.incomeDate
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      incomeDate: new Date(data.income_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateOfficeIncome(id: string, updates: Partial<OfficeIncome>): Promise<OfficeIncome> {
    const dbUpdates: any = {};
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.amount) dbUpdates.amount = updates.amount;
    if (updates.source) dbUpdates.source = updates.source;
    if (updates.incomeDate) dbUpdates.income_date = updates.incomeDate;

    const { data, error } = await supabase
      .from('office_income')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      incomeDate: new Date(data.income_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteOfficeIncome(id: string): Promise<void> {
    const { error } = await supabase
      .from('office_income')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Office Expenses
  async getOfficeExpenses(): Promise<OfficeExpense[]> {
    const { data, error } = await supabase
      .from('office_expenses')
      .select('*')
      .order('expense_date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(expense => ({
      ...expense,
      expenseDate: new Date(expense.expense_date),
      createdAt: new Date(expense.created_at),
      updatedAt: new Date(expense.updated_at)
    }));
  }

  async addOfficeExpense(expense: Omit<OfficeExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeExpense> {
    const { data, error } = await supabase
      .from('office_expenses')
      .insert({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        expense_date: expense.expenseDate
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      expenseDate: new Date(data.expense_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateOfficeExpense(id: string, updates: Partial<OfficeExpense>): Promise<OfficeExpense> {
    const dbUpdates: any = {};
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.amount) dbUpdates.amount = updates.amount;
    if (updates.category) dbUpdates.category = updates.category;
    if (updates.expenseDate) dbUpdates.expense_date = updates.expenseDate;

    const { data, error } = await supabase
      .from('office_expenses')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      expenseDate: new Date(data.expense_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteOfficeExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from('office_expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Client Balance calculation
  async getClientBalance(clientId: string): Promise<ClientBalance> {
    const [fees, payments, expenses] = await Promise.all([
      this.getClientFees(clientId),
      this.getClientPayments(clientId),
      this.getClientExpenses(clientId)
    ]);

    const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const balance = totalFees + totalExpenses - totalPayments;

    return {
      totalFees,
      totalPayments,
      totalExpenses,
      balance
    };
  }
}

export const supabaseStore = new SupabaseStore();

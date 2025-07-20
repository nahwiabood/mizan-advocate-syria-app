
import { Client, Case, CaseStage, Session, Task, Appointment, ClientFee, ClientPayment, ClientExpense, OfficeIncome, OfficeExpense, ClientBalance } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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
        national_id: client.nationalId,
        notes: client.notes
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      nationalId: data.national_id,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .update({
        name: updates.name,
        phone: updates.phone,
        email: updates.email,
        address: updates.address,
        national_id: updates.nationalId,
        notes: updates.notes
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      nationalId: data.national_id,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteClient(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  // Cases
  async getCases(): Promise<Case[]> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      clientId: item.client_id,
      title: item.title,
      description: item.description,
      opponent: item.opponent,
      subject: item.subject,
      caseType: item.case_type,
      status: item.status as 'active' | 'closed' | 'pending',
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
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
      id: data.id,
      clientId: data.client_id,
      title: data.title,
      description: data.description,
      opponent: data.opponent,
      subject: data.subject,
      caseType: data.case_type,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateCase(id: string, updates: Partial<Case>): Promise<Case | null> {
    const { data, error } = await supabase
      .from('cases')
      .update({
        client_id: updates.clientId,
        title: updates.title,
        description: updates.description,
        opponent: updates.opponent,
        subject: updates.subject,
        case_type: updates.caseType,
        status: updates.status
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      clientId: data.client_id,
      title: data.title,
      description: data.description,
      opponent: data.opponent,
      subject: data.subject,
      caseType: data.case_type,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteCase(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  // Case Stages
  async getStages(): Promise<CaseStage[]> {
    const { data, error } = await supabase
      .from('case_stages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      caseId: item.case_id,
      courtName: item.court_name,
      caseNumber: item.case_number,
      stageName: item.stage_name,
      firstSessionDate: item.first_session_date ? new Date(item.first_session_date) : new Date(),
      status: item.status as 'active' | 'completed',
      notes: item.notes,
      isResolved: item.is_resolved,
      resolutionDate: item.resolution_date ? new Date(item.resolution_date) : undefined,
      decisionNumber: item.decision_number,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
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
        is_resolved: stage.isResolved,
        resolution_date: stage.resolutionDate,
        decision_number: stage.decisionNumber
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      caseId: data.case_id,
      courtName: data.court_name,
      caseNumber: data.case_number,
      stageName: data.stage_name,
      firstSessionDate: new Date(data.first_session_date),
      status: data.status,
      notes: data.notes,
      isResolved: data.is_resolved,
      resolutionDate: data.resolution_date ? new Date(data.resolution_date) : undefined,
      decisionNumber: data.decision_number,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateStage(id: string, updates: Partial<CaseStage>): Promise<CaseStage | null> {
    const { data, error } = await supabase
      .from('case_stages')
      .update({
        case_id: updates.caseId,
        court_name: updates.courtName,
        case_number: updates.caseNumber,
        stage_name: updates.stageName,
        first_session_date: updates.firstSessionDate,
        status: updates.status,
        notes: updates.notes,
        is_resolved: updates.isResolved,
        resolution_date: updates.resolutionDate,
        decision_number: updates.decisionNumber
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      caseId: data.case_id,
      courtName: data.court_name,
      caseNumber: data.case_number,
      stageName: data.stage_name,
      firstSessionDate: new Date(data.first_session_date),
      status: data.status,
      notes: data.notes,
      isResolved: data.is_resolved,
      resolutionDate: data.resolution_date ? new Date(data.resolution_date) : undefined,
      decisionNumber: data.decision_number,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteStage(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('case_stages')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  // Sessions
  async getSessions(): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('session_date', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      stageId: item.stage_id,
      courtName: item.court_name,
      caseNumber: item.case_number,
      sessionDate: new Date(item.session_date),
      clientName: item.client_name,
      opponent: item.opponent,
      postponementReason: item.postponement_reason,
      nextSessionDate: item.next_session_date ? new Date(item.next_session_date) : undefined,
      nextPostponementReason: item.next_postponement_reason,
      isTransferred: item.is_transferred,
      isResolved: item.is_resolved,
      resolutionDate: item.resolution_date ? new Date(item.resolution_date) : undefined,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
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
        is_transferred: session.isTransferred,
        is_resolved: session.isResolved,
        resolution_date: session.resolutionDate
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      stageId: data.stage_id,
      courtName: data.court_name,
      caseNumber: data.case_number,
      sessionDate: new Date(data.session_date),
      clientName: data.client_name,
      opponent: data.opponent,
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

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | null> {
    const { data, error } = await supabase
      .from('sessions')
      .update({
        stage_id: updates.stageId,
        court_name: updates.courtName,
        case_number: updates.caseNumber,
        session_date: updates.sessionDate,
        client_name: updates.clientName,
        opponent: updates.opponent,
        postponement_reason: updates.postponementReason,
        next_session_date: updates.nextSessionDate,
        next_postponement_reason: updates.nextPostponementReason,
        is_transferred: updates.isTransferred,
        is_resolved: updates.isResolved,
        resolution_date: updates.resolutionDate
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      stageId: data.stage_id,
      courtName: data.court_name,
      caseNumber: data.case_number,
      sessionDate: new Date(data.session_date),
      clientName: data.client_name,
      opponent: data.opponent,
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

  async deleteSession(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  async resolveSession(sessionId: string): Promise<Session | null> {
    return this.updateSession(sessionId, {
      isResolved: true,
      resolutionDate: new Date()
    });
  }

  async transferSession(sessionId: string, nextDate: Date, reason: string): Promise<Session | null> {
    // Update current session
    await this.updateSession(sessionId, {
      nextSessionDate: nextDate,
      nextPostponementReason: reason,
      isTransferred: true
    });

    // Get current session to create new one
    const { data: currentSession } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!currentSession) return null;

    // Create new session
    return this.addSession({
      stageId: currentSession.stage_id,
      courtName: currentSession.court_name,
      caseNumber: currentSession.case_number,
      sessionDate: nextDate,
      clientName: currentSession.client_name,
      opponent: currentSession.opponent,
      isTransferred: false
    });
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      dueDate: item.due_date ? new Date(item.due_date) : undefined,
      priority: item.priority as 'low' | 'medium' | 'high',
      isCompleted: item.is_completed,
      completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
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
        is_completed: task.isCompleted,
        completed_at: task.completedAt
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      priority: data.priority,
      isCompleted: data.is_completed,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description,
        due_date: updates.dueDate,
        priority: updates.priority,
        is_completed: updates.isCompleted,
        completed_at: updates.completedAt
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      priority: data.priority,
      isCompleted: data.is_completed,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteTask(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      appointmentDate: new Date(item.appointment_date),
      time: item.time,
      duration: item.duration,
      clientName: item.client_name,
      location: item.location,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
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
        duration: appointment.duration,
        client_name: appointment.clientName,
        location: appointment.location
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      appointmentDate: new Date(data.appointment_date),
      time: data.time,
      duration: data.duration,
      clientName: data.client_name,
      location: data.location,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        title: updates.title,
        description: updates.description,
        appointment_date: updates.appointmentDate,
        time: updates.time,
        duration: updates.duration,
        client_name: updates.clientName,
        location: updates.location
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      appointmentDate: new Date(data.appointment_date),
      time: data.time,
      duration: data.duration,
      clientName: data.client_name,
      location: data.location,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  // Accounting methods
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
    
    return (data || []).map(item => ({
      id: item.id,
      clientId: item.client_id,
      description: item.description,
      amount: item.amount,
      feeDate: new Date(item.fee_date),
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
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
      id: data.id,
      clientId: data.client_id,
      description: data.description,
      amount: data.amount,
      feeDate: new Date(data.fee_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateClientFee(id: string, updates: Partial<ClientFee>): Promise<ClientFee | null> {
    const { data, error } = await supabase
      .from('client_fees')
      .update({
        client_id: updates.clientId,
        description: updates.description,
        amount: updates.amount,
        fee_date: updates.feeDate
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      clientId: data.client_id,
      description: data.description,
      amount: data.amount,
      feeDate: new Date(data.fee_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteClientFee(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('client_fees')
      .delete()
      .eq('id', id);
    
    return !error;
  }

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
    
    return (data || []).map(item => ({
      id: item.id,
      clientId: item.client_id,
      description: item.description,
      amount: item.amount,
      paymentDate: new Date(item.payment_date),
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
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
      id: data.id,
      clientId: data.client_id,
      description: data.description,
      amount: data.amount,
      paymentDate: new Date(data.payment_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateClientPayment(id: string, updates: Partial<ClientPayment>): Promise<ClientPayment | null> {
    const { data, error } = await supabase
      .from('client_payments')
      .update({
        client_id: updates.clientId,
        description: updates.description,
        amount: updates.amount,
        payment_date: updates.paymentDate
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      clientId: data.client_id,
      description: data.description,
      amount: data.amount,
      paymentDate: new Date(data.payment_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteClientPayment(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('client_payments')
      .delete()
      .eq('id', id);
    
    return !error;
  }

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
    
    return (data || []).map(item => ({
      id: item.id,
      clientId: item.client_id,
      description: item.description,
      amount: item.amount,
      expenseDate: new Date(item.expense_date),
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
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
      id: data.id,
      clientId: data.client_id,
      description: data.description,
      amount: data.amount,
      expenseDate: new Date(data.expense_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateClientExpense(id: string, updates: Partial<ClientExpense>): Promise<ClientExpense | null> {
    const { data, error } = await supabase
      .from('client_expenses')
      .update({
        client_id: updates.clientId,
        description: updates.description,
        amount: updates.amount,
        expense_date: updates.expenseDate
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      clientId: data.client_id,
      description: data.description,
      amount: data.amount,
      expenseDate: new Date(data.expense_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteClientExpense(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('client_expenses')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  async getOfficeIncome(): Promise<OfficeIncome[]> {
    const { data, error } = await supabase
      .from('office_income')
      .select('*')
      .order('income_date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      description: item.description,
      amount: item.amount,
      incomeDate: new Date(item.income_date),
      source: '', // Not in current schema, keeping for compatibility
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
  }

  async addOfficeIncome(income: Omit<OfficeIncome, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeIncome> {
    const { data, error } = await supabase
      .from('office_income')
      .insert({
        description: income.description,
        amount: income.amount,
        income_date: income.incomeDate
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      description: data.description,
      amount: data.amount,
      incomeDate: new Date(data.income_date),
      source: '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateOfficeIncome(id: string, updates: Partial<OfficeIncome>): Promise<OfficeIncome | null> {
    const { data, error } = await supabase
      .from('office_income')
      .update({
        description: updates.description,
        amount: updates.amount,
        income_date: updates.incomeDate
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      description: data.description,
      amount: data.amount,
      incomeDate: new Date(data.income_date),
      source: '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteOfficeIncome(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('office_income')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  async getOfficeExpenses(): Promise<OfficeExpense[]> {
    const { data, error } = await supabase
      .from('office_expenses')
      .select('*')
      .order('expense_date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      description: item.description,
      amount: item.amount,
      expenseDate: new Date(item.expense_date),
      category: '', // Not in current schema, keeping for compatibility
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
  }

  async addOfficeExpense(expense: Omit<OfficeExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeExpense> {
    const { data, error } = await supabase
      .from('office_expenses')
      .insert({
        description: expense.description,
        amount: expense.amount,
        expense_date: expense.expenseDate
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      description: data.description,
      amount: data.amount,
      expenseDate: new Date(data.expense_date),
      category: '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateOfficeExpense(id: string, updates: Partial<OfficeExpense>): Promise<OfficeExpense | null> {
    const { data, error } = await supabase
      .from('office_expenses')
      .update({
        description: updates.description,
        amount: updates.amount,
        expense_date: updates.expenseDate
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      description: data.description,
      amount: data.amount,
      expenseDate: new Date(data.expense_date),
      category: '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteOfficeExpense(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('office_expenses')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  async getClientBalance(clientId: string): Promise<ClientBalance> {
    const fees = await this.getClientFees(clientId);
    const payments = await this.getClientPayments(clientId);
    const expenses = await this.getClientExpenses(clientId);

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

  async exportData(): Promise<string> {
    const [
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
      officeExpenses
    ] = await Promise.all([
      this.getClients(),
      this.getCases(),
      this.getStages(),
      this.getSessions(),
      this.getTasks(),
      this.getAppointments(),
      this.getClientFees(),
      this.getClientPayments(),
      this.getClientExpenses(),
      this.getOfficeIncome(),
      this.getOfficeExpenses()
    ]);

    const data = {
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
      version: '1.0.0',
      exportDate: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      // Implementation would require careful handling of existing data
      // For now, return false to indicate not implemented
      console.log('Import functionality not yet implemented for Supabase');
      return false;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  async clearAllData(): Promise<void> {
    // This would be a dangerous operation - not implemented for safety
    console.log('Clear all data not implemented for safety reasons');
  }
}

export const supabaseStore = new SupabaseStore();


import { supabase } from '@/integrations/supabase/client';
import { Client, Case, CaseStage, Session, Task, Appointment, ClientFee, ClientPayment, ClientExpense, OfficeIncome, OfficeExpense, ClientBalance } from '@/types';

class SupabaseStore {
  // Sessions
  async getSessions(): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('session_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

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
        next_session_date: session.nextSessionDate,
        postponement_reason: session.postponementReason,
        next_postponement_reason: session.nextPostponementReason,
        is_transferred: session.isTransferred || false,
        is_resolved: session.isResolved || false,
        resolution_date: session.resolutionDate
      }])
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
      nextSessionDate: data.next_session_date ? new Date(data.next_session_date) : undefined,
      postponementReason: data.postponement_reason,
      nextPostponementReason: data.next_postponement_reason,
      isTransferred: data.is_transferred,
      isResolved: data.is_resolved,
      resolutionDate: data.resolution_date ? new Date(data.resolution_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | null> {
    const updateData: any = {};
    
    if (updates.stageId) updateData.stage_id = updates.stageId;
    if (updates.courtName) updateData.court_name = updates.courtName;
    if (updates.caseNumber) updateData.case_number = updates.caseNumber;
    if (updates.sessionDate) updateData.session_date = updates.sessionDate;
    if (updates.clientName) updateData.client_name = updates.clientName;
    if (updates.opponent !== undefined) updateData.opponent = updates.opponent;
    if (updates.nextSessionDate !== undefined) updateData.next_session_date = updates.nextSessionDate;
    if (updates.postponementReason !== undefined) updateData.postponement_reason = updates.postponementReason;
    if (updates.nextPostponementReason !== undefined) updateData.next_postponement_reason = updates.nextPostponementReason;
    if (updates.isTransferred !== undefined) updateData.is_transferred = updates.isTransferred;
    if (updates.isResolved !== undefined) updateData.is_resolved = updates.isResolved;
    if (updates.resolutionDate !== undefined) updateData.resolution_date = updates.resolutionDate;

    const { data, error } = await supabase
      .from('sessions')
      .update(updateData)
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
      nextSessionDate: data.next_session_date ? new Date(data.next_session_date) : undefined,
      postponementReason: data.postponement_reason,
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

    // Get the current session to create a new one
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
    return (data || []).map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
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
      .insert([{
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.dueDate,
        is_completed: task.isCompleted || false,
        completed_at: task.completedAt
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      isCompleted: data.is_completed,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const updateData: any = {};
    
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.priority) updateData.priority = updates.priority;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
    if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted;
    if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt;

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
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
      .order('appointment_date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(appointment => ({
      id: appointment.id,
      title: appointment.title,
      description: appointment.description,
      appointmentDate: new Date(appointment.appointment_date),
      time: appointment.time,
      location: appointment.location,
      createdAt: new Date(appointment.created_at),
      updatedAt: new Date(appointment.updated_at)
    }));
  }

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
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      appointmentDate: new Date(data.appointment_date),
      time: data.time,
      location: data.location,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    const updateData: any = {};
    
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.appointmentDate) updateData.appointment_date = updates.appointmentDate;
    if (updates.time !== undefined) updateData.time = updates.time;
    if (updates.location !== undefined) updateData.location = updates.location;

    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
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

  // Clients
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return (data || []).map(client => ({
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address,
      notes: client.notes,
      createdAt: new Date(client.created_at),
      updatedAt: new Date(client.updated_at)
    }));
  }

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
    
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
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
    return (data || []).map(case_ => ({
      id: case_.id,
      clientId: case_.client_id,
      caseNumber: case_.case_number,
      title: case_.title,
      description: case_.description,
      status: case_.status,
      createdAt: new Date(case_.created_at),
      updatedAt: new Date(case_.updated_at)
    }));
  }

  async addCase(case_: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Promise<Case> {
    const { data, error } = await supabase
      .from('cases')
      .insert([{
        client_id: case_.clientId,
        case_number: case_.caseNumber,
        title: case_.title,
        description: case_.description,
        status: case_.status
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      clientId: data.client_id,
      caseNumber: data.case_number,
      title: data.title,
      description: data.description,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateCase(id: string, updates: Partial<Case>): Promise<Case | null> {
    const updateData: any = {};
    
    if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
    if (updates.caseNumber) updateData.case_number = updates.caseNumber;
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status) updateData.status = updates.status;

    const { data, error } = await supabase
      .from('cases')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      clientId: data.client_id,
      caseNumber: data.case_number,
      title: data.title,
      description: data.description,
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
    return (data || []).map(stage => ({
      id: stage.id,
      caseId: stage.case_id,
      stageName: stage.stage_name,
      courtName: stage.court_name,
      firstSessionDate: stage.first_session_date ? new Date(stage.first_session_date) : undefined,
      resolutionDate: stage.resolution_date ? new Date(stage.resolution_date) : undefined,
      isResolved: stage.is_resolved,
      resolutionDetails: stage.resolution_details,
      createdAt: new Date(stage.created_at),
      updatedAt: new Date(stage.updated_at)
    }));
  }

  async addStage(stage: Omit<CaseStage, 'id' | 'createdAt' | 'updatedAt'>): Promise<CaseStage> {
    const { data, error } = await supabase
      .from('case_stages')
      .insert([{
        case_id: stage.caseId,
        stage_name: stage.stageName,
        court_name: stage.courtName,
        first_session_date: stage.firstSessionDate,
        resolution_date: stage.resolutionDate,
        is_resolved: stage.isResolved || false,
        resolution_details: stage.resolutionDetails
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      caseId: data.case_id,
      stageName: data.stage_name,
      courtName: data.court_name,
      firstSessionDate: data.first_session_date ? new Date(data.first_session_date) : undefined,
      resolutionDate: data.resolution_date ? new Date(data.resolution_date) : undefined,
      isResolved: data.is_resolved,
      resolutionDetails: data.resolution_details,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateStage(id: string, updates: Partial<CaseStage>): Promise<CaseStage | null> {
    const updateData: any = {};
    
    if (updates.caseId !== undefined) updateData.case_id = updates.caseId;
    if (updates.stageName) updateData.stage_name = updates.stageName;
    if (updates.courtName) updateData.court_name = updates.courtName;
    if (updates.firstSessionDate !== undefined) updateData.first_session_date = updates.firstSessionDate;
    if (updates.resolutionDate !== undefined) updateData.resolution_date = updates.resolutionDate;
    if (updates.isResolved !== undefined) updateData.is_resolved = updates.isResolved;
    if (updates.resolutionDetails !== undefined) updateData.resolution_details = updates.resolutionDetails;

    const { data, error } = await supabase
      .from('case_stages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      caseId: data.case_id,
      stageName: data.stage_name,
      courtName: data.court_name,
      firstSessionDate: data.first_session_date ? new Date(data.first_session_date) : undefined,
      resolutionDate: data.resolution_date ? new Date(data.resolution_date) : undefined,
      isResolved: data.is_resolved,
      resolutionDetails: data.resolution_details,
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
      id: fee.id,
      clientId: fee.client_id,
      description: fee.description,
      amount: fee.amount,
      feeDate: new Date(fee.fee_date),
      createdAt: new Date(fee.created_at),
      updatedAt: new Date(fee.updated_at)
    }));
  }

  async addClientFee(fee: Omit<ClientFee, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientFee> {
    const { data, error } = await supabase
      .from('client_fees')
      .insert([{
        client_id: fee.clientId,
        description: fee.description,
        amount: fee.amount,
        fee_date: fee.feeDate
      }])
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
    const updateData: any = {};
    
    if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
    if (updates.description) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.feeDate) updateData.fee_date = updates.feeDate;

    const { data, error } = await supabase
      .from('client_fees')
      .update(updateData)
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
      id: payment.id,
      clientId: payment.client_id,
      description: payment.description,
      amount: payment.amount,
      paymentDate: new Date(payment.payment_date),
      createdAt: new Date(payment.created_at),
      updatedAt: new Date(payment.updated_at)
    }));
  }

  async addClientPayment(payment: Omit<ClientPayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientPayment> {
    const { data, error } = await supabase
      .from('client_payments')
      .insert([{
        client_id: payment.clientId,
        description: payment.description,
        amount: payment.amount,
        payment_date: payment.paymentDate
      }])
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
    const updateData: any = {};
    
    if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
    if (updates.description) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.paymentDate) updateData.payment_date = updates.paymentDate;

    const { data, error } = await supabase
      .from('client_payments')
      .update(updateData)
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
      id: expense.id,
      clientId: expense.client_id,
      description: expense.description,
      amount: expense.amount,
      expenseDate: new Date(expense.expense_date),
      createdAt: new Date(expense.created_at),
      updatedAt: new Date(expense.updated_at)
    }));
  }

  async addClientExpense(expense: Omit<ClientExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientExpense> {
    const { data, error } = await supabase
      .from('client_expenses')
      .insert([{
        client_id: expense.clientId,
        description: expense.description,
        amount: expense.amount,
        expense_date: expense.expenseDate
      }])
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
    const updateData: any = {};
    
    if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
    if (updates.description) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.expenseDate) updateData.expense_date = updates.expenseDate;

    const { data, error } = await supabase
      .from('client_expenses')
      .update(updateData)
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

  // Office Income
  async getOfficeIncome(): Promise<OfficeIncome[]> {
    const { data, error } = await supabase
      .from('office_income')
      .select('*')
      .order('income_date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(income => ({
      id: income.id,
      description: income.description,
      amount: income.amount,
      incomeDate: new Date(income.income_date),
      createdAt: new Date(income.created_at),
      updatedAt: new Date(income.updated_at)
    }));
  }

  async addOfficeIncome(income: Omit<OfficeIncome, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeIncome> {
    const { data, error } = await supabase
      .from('office_income')
      .insert([{
        description: income.description,
        amount: income.amount,
        income_date: income.incomeDate
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      description: data.description,
      amount: data.amount,
      incomeDate: new Date(data.income_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateOfficeIncome(id: string, updates: Partial<OfficeIncome>): Promise<OfficeIncome | null> {
    const updateData: any = {};
    
    if (updates.description) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.incomeDate) updateData.income_date = updates.incomeDate;

    const { data, error } = await supabase
      .from('office_income')
      .update(updateData)
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

  // Office Expenses
  async getOfficeExpenses(): Promise<OfficeExpense[]> {
    const { data, error } = await supabase
      .from('office_expenses')
      .select('*')
      .order('expense_date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(expense => ({
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      expenseDate: new Date(expense.expense_date),
      createdAt: new Date(expense.created_at),
      updatedAt: new Date(expense.updated_at)
    }));
  }

  async addOfficeExpense(expense: Omit<OfficeExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeExpense> {
    const { data, error } = await supabase
      .from('office_expenses')
      .insert([{
        description: expense.description,
        amount: expense.amount,
        expense_date: expense.expenseDate
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      description: data.description,
      amount: data.amount,
      expenseDate: new Date(data.expense_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateOfficeExpense(id: string, updates: Partial<OfficeExpense>): Promise<OfficeExpense | null> {
    const updateData: any = {};
    
    if (updates.description) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.expenseDate) updateData.expense_date = updates.expenseDate;

    const { data, error } = await supabase
      .from('office_expenses')
      .update(updateData)
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

  // Client Balance
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

  // Data Export/Import
  async exportData(): Promise<string> {
    const data = {
      clients: await this.getClients(),
      cases: await this.getCases(),
      stages: await this.getStages(),
      sessions: await this.getSessions(),
      tasks: await this.getTasks(),
      appointments: await this.getAppointments(),
      clientFees: await this.getClientFees(),
      clientPayments: await this.getClientPayments(),
      clientExpenses: await this.getClientExpenses(),
      officeIncome: await this.getOfficeIncome(),
      officeExpenses: await this.getOfficeExpenses(),
      version: '1.0.0',
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      
      // This is a simplified import - in a real scenario, you'd want to be more careful
      // about data validation and handling conflicts
      
      console.log('Import functionality not fully implemented for Supabase');
      return false;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  async clearAllData(): Promise<void> {
    console.log('Clear all data functionality not implemented for Supabase');
  }
}

export const supabaseStore = new SupabaseStore();

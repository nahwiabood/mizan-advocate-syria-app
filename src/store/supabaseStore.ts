
import { supabase } from '@/integrations/supabase/client';
import { Client, Case, CaseStage, Session, Task, Appointment, ClientFee, ClientPayment, ClientExpense, OfficeIncome, OfficeExpense, ClientBalance } from '@/types';
import { formatDateForDB } from '@/utils/dateUtils';

class SupabaseStore {
  // Sessions
  async getSessions(): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('session_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }

    return data.map(session => ({
      id: session.id,
      stageId: session.stage_id,
      courtName: session.court_name,
      caseNumber: session.case_number,
      sessionDate: new Date(session.session_date),
      clientName: session.client_name,
      opponent: session.opponent || '',
      postponementReason: session.postponement_reason,
      nextSessionDate: session.next_session_date ? new Date(session.next_session_date) : undefined,
      nextPostponementReason: session.next_postponement_reason,
      isTransferred: session.is_transferred || false,
      isResolved: session.is_resolved || false,
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
        session_date: formatDateForDB(session.sessionDate),
        client_name: session.clientName,
        opponent: session.opponent,
        postponement_reason: session.postponementReason,
        next_session_date: session.nextSessionDate ? formatDateForDB(session.nextSessionDate) : null,
        next_postponement_reason: session.nextPostponementReason,
        is_transferred: session.isTransferred,
        is_resolved: session.isResolved,
        resolution_date: session.resolutionDate ? formatDateForDB(session.resolutionDate) : null
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding session:', error);
      throw error;
    }

    return {
      id: data.id,
      stageId: data.stage_id,
      courtName: data.court_name,
      caseNumber: data.case_number,
      sessionDate: new Date(data.session_date),
      clientName: data.client_name,
      opponent: data.opponent || '',
      postponementReason: data.postponement_reason,
      nextSessionDate: data.next_session_date ? new Date(data.next_session_date) : undefined,
      nextPostponementReason: data.next_postponement_reason,
      isTransferred: data.is_transferred || false,
      isResolved: data.is_resolved || false,
      resolutionDate: data.resolution_date ? new Date(data.resolution_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | null> {
    const updateData: any = {};
    
    if (updates.stageId !== undefined) updateData.stage_id = updates.stageId;
    if (updates.courtName !== undefined) updateData.court_name = updates.courtName;
    if (updates.caseNumber !== undefined) updateData.case_number = updates.caseNumber;
    if (updates.sessionDate !== undefined) updateData.session_date = formatDateForDB(updates.sessionDate);
    if (updates.clientName !== undefined) updateData.client_name = updates.clientName;
    if (updates.opponent !== undefined) updateData.opponent = updates.opponent;
    if (updates.postponementReason !== undefined) updateData.postponement_reason = updates.postponementReason;
    if (updates.nextSessionDate !== undefined) updateData.next_session_date = updates.nextSessionDate ? formatDateForDB(updates.nextSessionDate) : null;
    if (updates.nextPostponementReason !== undefined) updateData.next_postponement_reason = updates.nextPostponementReason;
    if (updates.isTransferred !== undefined) updateData.is_transferred = updates.isTransferred;
    if (updates.isResolved !== undefined) updateData.is_resolved = updates.isResolved;
    if (updates.resolutionDate !== undefined) updateData.resolution_date = updates.resolutionDate ? formatDateForDB(updates.resolutionDate) : null;

    const { data, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating session:', error);
      return null;
    }

    return {
      id: data.id,
      stageId: data.stage_id,
      courtName: data.court_name,
      caseNumber: data.case_number,
      sessionDate: new Date(data.session_date),
      clientName: data.client_name,
      opponent: data.opponent || '',
      postponementReason: data.postponement_reason,
      nextSessionDate: data.next_session_date ? new Date(data.next_session_date) : undefined,
      nextPostponementReason: data.next_postponement_reason,
      isTransferred: data.is_transferred || false,
      isResolved: data.is_resolved || false,
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
    return this.updateSession(sessionId, {
      nextSessionDate: nextDate,
      nextPostponementReason: reason,
      isTransferred: true
    });
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return data.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority as 'low' | 'medium' | 'high',
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      isCompleted: task.is_completed || false,
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
        priority: task.priority,
        due_date: task.dueDate ? formatDateForDB(task.dueDate) : null,
        is_completed: task.isCompleted,
        completed_at: task.completedAt?.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      throw error;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      priority: data.priority as 'low' | 'medium' | 'high',
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      isCompleted: data.is_completed || false,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate ? formatDateForDB(updates.dueDate) : null;
    if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted;
    if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt?.toISOString();

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      priority: data.priority as 'low' | 'medium' | 'high',
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      isCompleted: data.is_completed || false,
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
    
    if (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }

    return data.map(appointment => ({
      id: appointment.id,
      title: appointment.title,
      description: appointment.description,
      appointmentDate: new Date(appointment.appointment_date),
      time: appointment.time,
      duration: 60, // Default duration since it's not in DB
      clientName: undefined,
      location: appointment.location,
      createdAt: new Date(appointment.created_at),
      updatedAt: new Date(appointment.updated_at)
    }));
  }

  async addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        title: appointment.title,
        description: appointment.description,
        appointment_date: formatDateForDB(appointment.appointmentDate),
        time: appointment.time,
        location: appointment.location
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding appointment:', error);
      throw error;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      appointmentDate: new Date(data.appointment_date),
      time: data.time,
      duration: 60, // Default duration
      clientName: undefined,
      location: data.location,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.appointmentDate !== undefined) updateData.appointment_date = formatDateForDB(updates.appointmentDate);
    if (updates.time !== undefined) updateData.time = updates.time;
    if (updates.location !== undefined) updateData.location = updates.location;

    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating appointment:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      appointmentDate: new Date(data.appointment_date),
      time: data.time,
      duration: 60, // Default duration
      clientName: undefined,
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
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching clients:', error);
      return [];
    }

    return data.map(client => ({
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address,
      nationalId: undefined,
      notes: client.notes,
      createdAt: new Date(client.created_at),
      updatedAt: new Date(client.updated_at)
    }));
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

    if (error) {
      console.error('Error adding client:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      nationalId: undefined,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
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

    if (error) {
      console.error('Error updating client:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      nationalId: undefined,
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
    
    if (error) {
      console.error('Error fetching cases:', error);
      return [];
    }

    return data.map(case_ => ({
      id: case_.id,
      clientId: case_.client_id,
      title: case_.title,
      description: case_.description,
      opponent: case_.opponent || '',
      subject: case_.case_number || case_.title,
      caseType: 'عام',
      status: case_.status as 'active' | 'closed' | 'pending',
      createdAt: new Date(case_.created_at),
      updatedAt: new Date(case_.updated_at)
    }));
  }

  async addCase(case_: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Promise<Case> {
    const { data, error } = await supabase
      .from('cases')
      .insert({
        client_id: case_.clientId,
        title: case_.title,
        description: case_.description,
        case_number: case_.subject,
        opponent: case_.opponent
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding case:', error);
      throw error;
    }

    return {
      id: data.id,
      clientId: data.client_id,
      title: data.title,
      description: data.description,
      opponent: data.opponent,
      subject: data.case_number,
      caseType: case_.caseType,
      status: data.status as 'active' | 'closed' | 'pending',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateCase(id: string, updates: Partial<Case>): Promise<Case | null> {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.subject !== undefined) updateData.case_number = updates.subject;
    if (updates.opponent !== undefined) updateData.opponent = updates.opponent;

    const { data, error } = await supabase
      .from('cases')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating case:', error);
      return null;
    }

    return {
      id: data.id,
      clientId: data.client_id,
      title: data.title,
      description: data.description,
      opponent: data.opponent || '',
      subject: data.case_number || '',
      caseType: updates.caseType || 'عام',
      status: data.status as 'active' | 'closed' | 'pending',
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

  // Stages
  async getStages(): Promise<CaseStage[]> {
    const { data, error } = await supabase
      .from('case_stages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching stages:', error);
      return [];
    }

    return data.map(stage => ({
      id: stage.id,
      caseId: stage.case_id,
      courtName: stage.court_name,
      caseNumber: stage.case_number_ref || '',
      stageName: stage.stage_name,
      firstSessionDate: stage.first_session_date ? new Date(stage.first_session_date) : new Date(),
      status: 'active' as 'active' | 'completed',
      notes: stage.resolution_details,
      isResolved: stage.is_resolved || false,
      resolutionDate: stage.resolution_date ? new Date(stage.resolution_date) : undefined,
      decisionNumber: undefined,
      createdAt: new Date(stage.created_at),
      updatedAt: new Date(stage.updated_at)
    }));
  }

  async addStage(stage: Omit<CaseStage, 'id' | 'createdAt' | 'updatedAt'>): Promise<CaseStage> {
    const { data, error } = await supabase
      .from('case_stages')
      .insert({
        case_id: stage.caseId,
        stage_name: stage.stageName,
        court_name: stage.courtName,
        case_number_ref: stage.caseNumber,
        first_session_date: stage.firstSessionDate ? formatDateForDB(stage.firstSessionDate) : null,
        is_resolved: stage.isResolved || false,
        resolution_date: stage.resolutionDate ? formatDateForDB(stage.resolutionDate) : null,
        resolution_details: stage.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding stage:', error);
      throw error;
    }

    return {
      id: data.id,
      caseId: data.case_id,
      courtName: data.court_name,
      caseNumber: stage.caseNumber || '',
      stageName: data.stage_name,
      firstSessionDate: data.first_session_date ? new Date(data.first_session_date) : new Date(),
      status: 'active' as 'active' | 'completed',
      notes: stage.notes,
      isResolved: data.is_resolved || false,
      resolutionDate: data.resolution_date ? new Date(data.resolution_date) : undefined,
      decisionNumber: stage.decisionNumber,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateStage(id: string, updates: Partial<CaseStage>): Promise<CaseStage | null> {
    const updateData: any = {};
    
    if (updates.stageName !== undefined) updateData.stage_name = updates.stageName;
    if (updates.courtName !== undefined) updateData.court_name = updates.courtName;
    if (updates.caseNumber !== undefined) updateData.case_number_ref = updates.caseNumber;
    if (updates.firstSessionDate !== undefined) updateData.first_session_date = updates.firstSessionDate ? formatDateForDB(updates.firstSessionDate) : null;
    if (updates.isResolved !== undefined) updateData.is_resolved = updates.isResolved;
    if (updates.resolutionDate !== undefined) updateData.resolution_date = updates.resolutionDate ? formatDateForDB(updates.resolutionDate) : null;
    if (updates.notes !== undefined) updateData.resolution_details = updates.notes;

    const { data, error } = await supabase
      .from('case_stages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating stage:', error);
      return null;
    }

    return {
      id: data.id,
      caseId: data.case_id,
      courtName: data.court_name,
      caseNumber: updates.caseNumber || '',
      stageName: data.stage_name,
      firstSessionDate: data.first_session_date ? new Date(data.first_session_date) : new Date(),
      status: 'active' as 'active' | 'completed',
      notes: updates.notes,
      isResolved: data.is_resolved || false,
      resolutionDate: data.resolution_date ? new Date(data.resolution_date) : undefined,
      decisionNumber: updates.decisionNumber,
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
    let query = supabase.from('client_fees').select('*');
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error } = await query.order('fee_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching client fees:', error);
      return [];
    }

    return data.map(fee => ({
      id: fee.id,
      clientId: fee.client_id,
      description: fee.description,
      amount: parseFloat(fee.amount),
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
        fee_date: formatDateForDB(fee.feeDate)
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding client fee:', error);
      throw error;
    }

    return {
      id: data.id,
      clientId: data.client_id,
      description: data.description,
      amount: parseFloat(data.amount),
      feeDate: new Date(data.fee_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateClientFee(id: string, updates: Partial<ClientFee>): Promise<ClientFee | null> {
    const updateData: any = {};
    
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.feeDate !== undefined) updateData.fee_date = formatDateForDB(updates.feeDate);

    const { data, error } = await supabase
      .from('client_fees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client fee:', error);
      return null;
    }

    return {
      id: data.id,
      clientId: data.client_id,
      description: data.description,
      amount: parseFloat(data.amount),
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
    let query = supabase.from('client_payments').select('*');
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error } = await query.order('payment_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching client payments:', error);
      return [];
    }

    return data.map(payment => ({
      id: payment.id,
      clientId: payment.client_id,
      description: payment.description,
      amount: parseFloat(payment.amount),
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
        payment_date: formatDateForDB(payment.paymentDate)
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding client payment:', error);
      throw error;
    }

    return {
      id: data.id,
      clientId: data.client_id,
      description: data.description,
      amount: parseFloat(data.amount),
      paymentDate: new Date(data.payment_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateClientPayment(id: string, updates: Partial<ClientPayment>): Promise<ClientPayment | null> {
    const updateData: any = {};
    
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.paymentDate !== undefined) updateData.payment_date = formatDateForDB(updates.paymentDate);

    const { data, error } = await supabase
      .from('client_payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client payment:', error);
      return null;
    }

    return {
      id: data.id,
      clientId: data.client_id,
      description: data.description,
      amount: parseFloat(data.amount),
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
    let query = supabase.from('client_expenses').select('*');
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error } = await query.order('expense_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching client expenses:', error);
      return [];
    }

    return data.map(expense => ({
      id: expense.id,
      clientId: expense.client_id,
      description: expense.description,
      amount: parseFloat(expense.amount),
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
        expense_date: formatDateForDB(expense.expenseDate)
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding client expense:', error);
      throw error;
    }

    return {
      id: data.id,
      clientId: data.client_id,
      description: data.description,
      amount: parseFloat(data.amount),
      expenseDate: new Date(data.expense_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateClientExpense(id: string, updates: Partial<ClientExpense>): Promise<ClientExpense | null> {
    const updateData: any = {};
    
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.expenseDate !== undefined) updateData.expense_date = formatDateForDB(updates.expenseDate);

    const { data, error } = await supabase
      .from('client_expenses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client expense:', error);
      return null;
    }

    return {
      id: data.id,
      clientId: data.client_id,
      description: data.description,
      amount: parseFloat(data.amount),
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
    
    if (error) {
      console.error('Error fetching office income:', error);
      return [];
    }

    return data.map(income => ({
      id: income.id,
      description: income.description,
      amount: parseFloat(income.amount),
      incomeDate: new Date(income.income_date),
      source: 'عام', // Default source
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
        income_date: formatDateForDB(income.incomeDate)
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding office income:', error);
      throw error;
    }

    return {
      id: data.id,
      description: data.description,
      amount: parseFloat(data.amount),
      incomeDate: new Date(data.income_date),
      source: income.source || 'عام',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateOfficeIncome(id: string, updates: Partial<OfficeIncome>): Promise<OfficeIncome | null> {
    const updateData: any = {};
    
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.incomeDate !== undefined) updateData.income_date = formatDateForDB(updates.incomeDate);

    const { data, error } = await supabase
      .from('office_income')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating office income:', error);
      return null;
    }

    return {
      id: data.id,
      description: data.description,
      amount: parseFloat(data.amount),
      incomeDate: new Date(data.income_date),
      source: updates.source || 'عام',
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
    
    if (error) {
      console.error('Error fetching office expenses:', error);
      return [];
    }

    return data.map(expense => ({
      id: expense.id,
      description: expense.description,
      amount: parseFloat(expense.amount),
      expenseDate: new Date(expense.expense_date),
      category: 'عام', // Default category
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
        expense_date: formatDateForDB(expense.expenseDate)
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding office expense:', error);
      throw error;
    }

    return {
      id: data.id,
      description: data.description,
      amount: parseFloat(data.amount),
      expenseDate: new Date(data.expense_date),
      category: expense.category || 'عام',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateOfficeExpense(id: string, updates: Partial<OfficeExpense>): Promise<OfficeExpense | null> {
    const updateData: any = {};
    
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.expenseDate !== undefined) updateData.expense_date = formatDateForDB(updates.expenseDate);

    const { data, error } = await supabase
      .from('office_expenses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating office expense:', error);
      return null;
    }

    return {
      id: data.id,
      description: data.description,
      amount: parseFloat(data.amount),
      expenseDate: new Date(data.expense_date),
      category: updates.category || 'عام',
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
    const balance = totalFees - totalPayments - totalExpenses;

    return {
      totalFees,
      totalPayments,
      totalExpenses,
      balance
    };
  }

  // Export/Import
  async exportData(): Promise<string> {
    const [clients, cases, stages, sessions, tasks, appointments, clientFees, clientPayments, clientExpenses, officeIncome, officeExpenses] = await Promise.all([
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
      officeExpenses
    };

    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      
      // Clear existing data
      await this.clearAllData();
      
      // Import in order of dependencies
      if (data.clients) {
        for (const client of data.clients) {
          await this.addClient(client);
        }
      }
      
      if (data.cases) {
        for (const case_ of data.cases) {
          await this.addCase(case_);
        }
      }
      
      if (data.stages) {
        for (const stage of data.stages) {
          await this.addStage(stage);
        }
      }
      
      if (data.sessions) {
        for (const session of data.sessions) {
          await this.addSession(session);
        }
      }
      
      if (data.tasks) {
        for (const task of data.tasks) {
          await this.addTask(task);
        }
      }
      
      if (data.appointments) {
        for (const appointment of data.appointments) {
          await this.addAppointment(appointment);
        }
      }
      
      if (data.clientFees) {
        for (const fee of data.clientFees) {
          await this.addClientFee(fee);
        }
      }
      
      if (data.clientPayments) {
        for (const payment of data.clientPayments) {
          await this.addClientPayment(payment);
        }
      }
      
      if (data.clientExpenses) {
        for (const expense of data.clientExpenses) {
          await this.addClientExpense(expense);
        }
      }
      
      if (data.officeIncome) {
        for (const income of data.officeIncome) {
          await this.addOfficeIncome(income);
        }
      }
      
      if (data.officeExpenses) {
        for (const expense of data.officeExpenses) {
          await this.addOfficeExpense(expense);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      // Delete in reverse order of dependencies
      await Promise.all([
        supabase.from('sessions').delete().neq('id', ''),
        supabase.from('case_stages').delete().neq('id', ''),
        supabase.from('cases').delete().neq('id', ''),
        supabase.from('clients').delete().neq('id', ''),
        supabase.from('tasks').delete().neq('id', ''),
        supabase.from('appointments').delete().neq('id', ''),
        supabase.from('client_fees').delete().neq('id', ''),
        supabase.from('client_payments').delete().neq('id', ''),
        supabase.from('client_expenses').delete().neq('id', ''),
        supabase.from('office_income').delete().neq('id', ''),
        supabase.from('office_expenses').delete().neq('id', '')
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}

export const supabaseStore = new SupabaseStore();

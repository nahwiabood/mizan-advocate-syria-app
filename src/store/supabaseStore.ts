
import { supabase } from '@/integrations/supabase/client';
import { Client, Case, CaseStage, Session, Task, Appointment, ClientFee, ClientPayment, ClientExpense, OfficeIncome, OfficeExpense, ClientBalance } from '@/types';

class SupabaseStore {
  // Convert Supabase date strings to Date objects
  private convertDates = {
    session: (session: any): Session => ({
      ...session,
      sessionDate: new Date(session.session_date),
      nextSessionDate: session.next_session_date ? new Date(session.next_session_date) : undefined,
      resolutionDate: session.resolution_date ? new Date(session.resolution_date) : undefined,
      createdAt: new Date(session.created_at),
      updatedAt: new Date(session.updated_at),
    }),
    
    task: (task: any): Task => ({
      ...task,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
    }),
    
    appointment: (appointment: any): Appointment => ({
      ...appointment,
      appointmentDate: new Date(appointment.appointment_date),
      duration: 60, // Default duration
      createdAt: new Date(appointment.created_at),
      updatedAt: new Date(appointment.updated_at),
    }),
    
    client: (client: any): Client => ({
      ...client,
      createdAt: new Date(client.created_at),
      updatedAt: new Date(client.updated_at),
    }),
    
    case: (case_: any): Case => ({
      ...case_,
      clientId: case_.client_id,
      caseType: case_.case_number,
      subject: case_.title,
      opponent: case_.description || '',
      createdAt: new Date(case_.created_at),
      updatedAt: new Date(case_.updated_at),
    }),
    
    stage: (stage: any): CaseStage => ({
      ...stage,
      caseId: stage.case_id,
      stageName: stage.stage_name,
      courtName: stage.court_name,
      firstSessionDate: stage.first_session_date ? new Date(stage.first_session_date) : new Date(),
      status: stage.is_resolved ? 'completed' : 'active',
      notes: stage.resolution_details,
      isResolved: stage.is_resolved,
      resolutionDate: stage.resolution_date ? new Date(stage.resolution_date) : undefined,
      createdAt: new Date(stage.created_at),
      updatedAt: new Date(stage.updated_at),
    }),

    clientFee: (fee: any): ClientFee => ({
      ...fee,
      clientId: fee.client_id,
      feeDate: new Date(fee.fee_date),
      createdAt: new Date(fee.created_at),
      updatedAt: new Date(fee.updated_at),
    }),

    clientPayment: (payment: any): ClientPayment => ({
      ...payment,
      clientId: payment.client_id,
      paymentDate: new Date(payment.payment_date),
      createdAt: new Date(payment.created_at),
      updatedAt: new Date(payment.updated_at),
    }),

    clientExpense: (expense: any): ClientExpense => ({
      ...expense,
      clientId: expense.client_id,
      expenseDate: new Date(expense.expense_date),
      createdAt: new Date(expense.created_at),
      updatedAt: new Date(expense.updated_at),
    }),

    officeIncome: (income: any): OfficeIncome => ({
      ...income,
      incomeDate: new Date(income.income_date),
      source: income.description,
      createdAt: new Date(income.created_at),
      updatedAt: new Date(income.updated_at),
    }),

    officeExpense: (expense: any): OfficeExpense => ({
      ...expense,
      expenseDate: new Date(expense.expense_date),
      category: expense.description,
      createdAt: new Date(expense.created_at),
      updatedAt: new Date(expense.updated_at),
    }),
  };

  // Sessions
  async getSessions(): Promise<Session[]> {
    const { data, error } = await supabase.from('sessions').select('*');
    if (error) throw error;
    return data?.map(this.convertDates.session) || [];
  }

  async addSession(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        stage_id: session.stageId,
        court_name: session.courtName,
        case_number: session.caseNumber,
        session_date: session.sessionDate.toISOString().split('T')[0],
        client_name: session.clientName,
        opponent: session.opponent,
        postponement_reason: session.postponementReason,
        next_session_date: session.nextSessionDate?.toISOString().split('T')[0],
        next_postponement_reason: session.nextPostponementReason,
        is_transferred: session.isTransferred,
        is_resolved: session.isResolved,
        resolution_date: session.resolutionDate?.toISOString().split('T')[0],
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.session(data);
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | null> {
    const updateData: any = {};
    if (updates.sessionDate) updateData.session_date = updates.sessionDate.toISOString().split('T')[0];
    if (updates.nextSessionDate) updateData.next_session_date = updates.nextSessionDate.toISOString().split('T')[0];
    if (updates.resolutionDate) updateData.resolution_date = updates.resolutionDate.toISOString().split('T')[0];
    if (updates.courtName) updateData.court_name = updates.courtName;
    if (updates.caseNumber) updateData.case_number = updates.caseNumber;
    if (updates.clientName) updateData.client_name = updates.clientName;
    if (updates.opponent) updateData.opponent = updates.opponent;
    if (updates.postponementReason) updateData.postponement_reason = updates.postponementReason;
    if (updates.nextPostponementReason) updateData.next_postponement_reason = updates.nextPostponementReason;
    if (updates.isTransferred !== undefined) updateData.is_transferred = updates.isTransferred;
    if (updates.isResolved !== undefined) updateData.is_resolved = updates.isResolved;

    const { data, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.session(data);
  }

  async deleteSession(id: string): Promise<boolean> {
    const { error } = await supabase.from('sessions').delete().eq('id', id);
    return !error;
  }

  async resolveSession(sessionId: string): Promise<Session | null> {
    return this.updateSession(sessionId, { 
      isResolved: true, 
      resolutionDate: new Date() 
    });
  }

  async transferSession(sessionId: string, nextDate: Date, reason: string): Promise<Session | null> {
    await this.updateSession(sessionId, {
      nextSessionDate: nextDate,
      nextPostponementReason: reason,
      isTransferred: true
    });

    const session = await this.getSessionById(sessionId);
    if (!session) return null;

    return this.addSession({
      stageId: session.stageId,
      courtName: session.courtName,
      caseNumber: session.caseNumber,
      sessionDate: nextDate,
      clientName: session.clientName,
      opponent: session.opponent,
      isTransferred: false,
    });
  }

  private async getSessionById(id: string): Promise<Session | null> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return this.convertDates.session(data);
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) throw error;
    return data?.map(this.convertDates.task) || [];
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        due_date: task.dueDate?.toISOString().split('T')[0],
        priority: task.priority,
        is_completed: task.isCompleted,
        completed_at: task.completedAt?.toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.task(data);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.dueDate) updateData.due_date = updates.dueDate.toISOString().split('T')[0];
    if (updates.priority) updateData.priority = updates.priority;
    if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted;
    if (updates.completedAt) updateData.completed_at = updates.completedAt.toISOString();

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.task(data);
  }

  async deleteTask(id: string): Promise<boolean> {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    return !error;
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase.from('appointments').select('*');
    if (error) throw error;
    return data?.map(this.convertDates.appointment) || [];
  }

  async addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        title: appointment.title,
        description: appointment.description,
        appointment_date: appointment.appointmentDate.toISOString().split('T')[0],
        time: appointment.time,
        location: appointment.location,
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.appointment(data);
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.appointmentDate) updateData.appointment_date = updates.appointmentDate.toISOString().split('T')[0];
    if (updates.time) updateData.time = updates.time;
    if (updates.location) updateData.location = updates.location;

    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.appointment(data);
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    return !error;
  }

  // Clients
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) throw error;
    return data?.map(this.convertDates.client) || [];
  }

  async addClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address,  
        notes: client.notes,
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.client(data);
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .update({
        name: updates.name,
        phone: updates.phone,
        email: updates.email,
        address: updates.address,
        notes: updates.notes,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.client(data);
  }

  async deleteClient(id: string): Promise<boolean> {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    return !error;
  }

  // Cases
  async getCases(): Promise<Case[]> {
    const { data, error } = await supabase.from('cases').select('*');
    if (error) throw error;
    return data?.map(this.convertDates.case) || [];
  }

  async addCase(case_: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Promise<Case> {
    const { data, error } = await supabase
      .from('cases')
      .insert({
        client_id: case_.clientId,
        case_number: case_.caseType,
        title: case_.subject,
        description: case_.opponent,
        status: case_.status,
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.case(data);
  }

  async updateCase(id: string, updates: Partial<Case>): Promise<Case | null> {
    const updateData: any = {};
    if (updates.clientId) updateData.client_id = updates.clientId;
    if (updates.caseType) updateData.case_number = updates.caseType;
    if (updates.subject) updateData.title = updates.subject;
    if (updates.opponent) updateData.description = updates.opponent;
    if (updates.status) updateData.status = updates.status;

    const { data, error } = await supabase
      .from('cases')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.case(data);
  }

  async deleteCase(id: string): Promise<boolean> {
    const { error } = await supabase.from('cases').delete().eq('id', id);
    return !error;
  }

  // Stages
  async getStages(): Promise<CaseStage[]> {
    const { data, error } = await supabase.from('case_stages').select('*');
    if (error) throw error;
    return data?.map(this.convertDates.stage) || [];
  }

  async addStage(stage: Omit<CaseStage, 'id' | 'createdAt' | 'updatedAt'>): Promise<CaseStage> {
    const { data, error } = await supabase
      .from('case_stages')
      .insert({
        case_id: stage.caseId,
        stage_name: stage.stageName,
        court_name: stage.courtName,
        first_session_date: stage.firstSessionDate.toISOString().split('T')[0],
        resolution_date: stage.resolutionDate?.toISOString().split('T')[0],
        resolution_details: stage.notes,
        is_resolved: stage.isResolved,
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.stage(data);
  }

  async updateStage(id: string, updates: Partial<CaseStage>): Promise<CaseStage | null> {
    const updateData: any = {};
    if (updates.stageName) updateData.stage_name = updates.stageName;
    if (updates.courtName) updateData.court_name = updates.courtName;
    if (updates.firstSessionDate) updateData.first_session_date = updates.firstSessionDate.toISOString().split('T')[0];
    if (updates.resolutionDate) updateData.resolution_date = updates.resolutionDate.toISOString().split('T')[0];
    if (updates.notes) updateData.resolution_details = updates.notes;
    if (updates.isResolved !== undefined) updateData.is_resolved = updates.isResolved;

    const { data, error } = await supabase
      .from('case_stages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.stage(data);
  }

  async deleteStage(id: string): Promise<boolean> {
    const { error } = await supabase.from('case_stages').delete().eq('id', id);
    return !error;
  }

  // Client Fees
  async getClientFees(clientId?: string): Promise<ClientFee[]> {
    let query = supabase.from('client_fees').select('*');
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data?.map(this.convertDates.clientFee) || [];
  }

  async addClientFee(fee: Omit<ClientFee, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientFee> {
    const { data, error } = await supabase
      .from('client_fees')
      .insert({
        client_id: fee.clientId,
        description: fee.description,
        amount: fee.amount,
        fee_date: fee.feeDate.toISOString().split('T')[0],
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.clientFee(data);
  }

  async updateClientFee(id: string, updates: Partial<ClientFee>): Promise<ClientFee | null> {
    const updateData: any = {};
    if (updates.description) updateData.description = updates.description;
    if (updates.amount) updateData.amount = updates.amount;
    if (updates.feeDate) updateData.fee_date = updates.feeDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('client_fees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.clientFee(data);
  }

  async deleteClientFee(id: string): Promise<boolean> {
    const { error } = await supabase.from('client_fees').delete().eq('id', id);
    return !error;
  }

  // Client Payments
  async getClientPayments(clientId?: string): Promise<ClientPayment[]> {
    let query = supabase.from('client_payments').select('*');
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data?.map(this.convertDates.clientPayment) || [];
  }

  async addClientPayment(payment: Omit<ClientPayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientPayment> {
    const { data, error } = await supabase
      .from('client_payments')
      .insert({
        client_id: payment.clientId,
        description: payment.description,
        amount: payment.amount,
        payment_date: payment.paymentDate.toISOString().split('T')[0],
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.clientPayment(data);
  }

  async updateClientPayment(id: string, updates: Partial<ClientPayment>): Promise<ClientPayment | null> {
    const updateData: any = {};
    if (updates.description) updateData.description = updates.description;
    if (updates.amount) updateData.amount = updates.amount;
    if (updates.paymentDate) updateData.payment_date = updates.paymentDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('client_payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.clientPayment(data);
  }

  async deleteClientPayment(id: string): Promise<boolean> {
    const { error } = await supabase.from('client_payments').delete().eq('id', id);
    return !error;
  }

  // Client Expenses
  async getClientExpenses(clientId?: string): Promise<ClientExpense[]> {
    let query = supabase.from('client_expenses').select('*');
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data?.map(this.convertDates.clientExpense) || [];
  }

  async addClientExpense(expense: Omit<ClientExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientExpense> {
    const { data, error } = await supabase
      .from('client_expenses')
      .insert({
        client_id: expense.clientId,
        description: expense.description,
        amount: expense.amount,
        expense_date: expense.expenseDate.toISOString().split('T')[0],
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.clientExpense(data);
  }

  async updateClientExpense(id: string, updates: Partial<ClientExpense>): Promise<ClientExpense | null> {
    const updateData: any = {};
    if (updates.description) updateData.description = updates.description;
    if (updates.amount) updateData.amount = updates.amount;
    if (updates.expenseDate) updateData.expense_date = updates.expenseDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('client_expenses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.clientExpense(data);
  }

  async deleteClientExpense(id: string): Promise<boolean> {
    const { error } = await supabase.from('client_expenses').delete().eq('id', id);
    return !error;
  }

  // Office Income
  async getOfficeIncome(): Promise<OfficeIncome[]> {
    const { data, error } = await supabase.from('office_income').select('*');
    if (error) throw error;
    return data?.map(this.convertDates.officeIncome) || [];
  }

  async addOfficeIncome(income: Omit<OfficeIncome, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeIncome> {
    const { data, error } = await supabase
      .from('office_income')
      .insert({
        description: income.description,
        amount: income.amount,
        income_date: income.incomeDate.toISOString().split('T')[0],
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.officeIncome(data);
  }

  async updateOfficeIncome(id: string, updates: Partial<OfficeIncome>): Promise<OfficeIncome | null> {
    const updateData: any = {};
    if (updates.description) updateData.description = updates.description;
    if (updates.amount) updateData.amount = updates.amount;
    if (updates.incomeDate) updateData.income_date = updates.incomeDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('office_income')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.officeIncome(data);
  }

  async deleteOfficeIncome(id: string): Promise<boolean> {
    const { error } = await supabase.from('office_income').delete().eq('id', id);
    return !error;
  }

  // Office Expenses
  async getOfficeExpenses(): Promise<OfficeExpense[]> {
    const { data, error } = await supabase.from('office_expenses').select('*');
    if (error) throw error;
    return data?.map(this.convertDates.officeExpense) || [];
  }

  async addOfficeExpense(expense: Omit<OfficeExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeExpense> {
    const { data, error } = await supabase
      .from('office_expenses')
      .insert({
        description: expense.description,
        amount: expense.amount,
        expense_date: expense.expenseDate.toISOString().split('T')[0],
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.officeExpense(data);
  }

  async updateOfficeExpense(id: string, updates: Partial<OfficeExpense>): Promise<OfficeExpense | null> {
    const updateData: any = {};
    if (updates.description) updateData.description = updates.description;
    if (updates.amount) updateData.amount = updates.amount;
    if (updates.expenseDate) updateData.expense_date = updates.expenseDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('office_expenses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.convertDates.officeExpense(data);
  }

  async deleteOfficeExpense(id: string): Promise<boolean> {
    const { error } = await supabase.from('office_expenses').delete().eq('id', id);
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

  // Import/Export functionality (for compatibility)
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
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      
      // Clear existing data first
      await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('case_stages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('cases').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('client_fees').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('client_payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('client_expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('office_income').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('office_expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Import new data
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
    await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('case_stages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('cases').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('client_fees').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('client_payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('client_expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('office_income').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('office_expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }
}

export const supabaseStore = new SupabaseStore();

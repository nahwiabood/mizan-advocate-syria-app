import { Client, Case, CaseStage, Session, Task, Appointment, CaseFee, Payment, Expense, CaseAccountSummary, ClientAccountSummary } from '@/types';

class DataStore {
  private storageKey = 'lawyer-management-data';
  private cache: any = null;
  private isInitialized = false;

  private defaultData = {
    clients: [] as Client[],
    cases: [] as Case[],
    stages: [] as CaseStage[],
    sessions: [] as Session[],
    tasks: [] as Task[],
    appointments: [] as Appointment[],
    caseFees: [] as CaseFee[],
    payments: [] as Payment[],
    expenses: [] as Expense[],
    version: '1.0.0', // Added version tracking
  };

  // Initialize the store
  initialize() {
    if (!this.isInitialized) {
      this.loadFromStorage();
      this.isInitialized = true;
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.convertDates(data);
        this.cache = { ...this.defaultData, ...data };
      } else {
        this.cache = { ...this.defaultData };
      }
    } catch (error) {
      console.error('Error loading data from storage:', error);
      this.cache = { ...this.defaultData };
    }
  }

  getData() {
    if (!this.isInitialized) {
      this.initialize();
    }
    return this.cache;
  }

  private convertDates(data: any) {
    // Helper function to safely convert dates
    const safeConvertDate = (dateValue: any): Date | null => {
      if (!dateValue) return null;
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date;
    };

    // Convert case fee dates
    data.caseFees?.forEach((fee: any) => {
      const dateSet = safeConvertDate(fee.dateSet);
      if (dateSet) fee.dateSet = dateSet;
      
      if (fee.paidDate) {
        const paidDate = safeConvertDate(fee.paidDate);
        if (paidDate) fee.paidDate = paidDate;
      }
      
      const createdAt = safeConvertDate(fee.createdAt);
      if (createdAt) fee.createdAt = createdAt;
      
      const updatedAt = safeConvertDate(fee.updatedAt);
      if (updatedAt) fee.updatedAt = updatedAt;
    });

    // Convert payment dates
    data.payments?.forEach((payment: any) => {
      const paymentDate = safeConvertDate(payment.paymentDate);
      if (paymentDate) payment.paymentDate = paymentDate;
      
      const createdAt = safeConvertDate(payment.createdAt);
      if (createdAt) payment.createdAt = createdAt;
      
      const updatedAt = safeConvertDate(payment.updatedAt);
      if (updatedAt) payment.updatedAt = updatedAt;
    });

    // Convert expense dates
    data.expenses?.forEach((expense: any) => {
      const expenseDate = safeConvertDate(expense.expenseDate);
      if (expenseDate) expense.expenseDate = expenseDate;
      
      if (expense.reimbursedDate) {
        const reimbursedDate = safeConvertDate(expense.reimbursedDate);
        if (reimbursedDate) expense.reimbursedDate = reimbursedDate;
      }
      
      const createdAt = safeConvertDate(expense.createdAt);
      if (createdAt) expense.createdAt = createdAt;
      
      const updatedAt = safeConvertDate(expense.updatedAt);
      if (updatedAt) expense.updatedAt = updatedAt;
    });

    // Convert session dates
    data.sessions?.forEach((session: any) => {
      const sessionDate = safeConvertDate(session.sessionDate);
      if (sessionDate) session.sessionDate = sessionDate;
      
      if (session.nextSessionDate) {
        const nextDate = safeConvertDate(session.nextSessionDate);
        if (nextDate) session.nextSessionDate = nextDate;
      }
      
      if (session.resolutionDate) {
        const resolutionDate = safeConvertDate(session.resolutionDate);
        if (resolutionDate) session.resolutionDate = resolutionDate;
      }
      
      const createdAt = safeConvertDate(session.createdAt);
      if (createdAt) session.createdAt = createdAt;
      
      const updatedAt = safeConvertDate(session.updatedAt);
      if (updatedAt) session.updatedAt = updatedAt;
    });

    // Convert task dates
    data.tasks?.forEach((task: any) => {
      if (task.dueDate) {
        const dueDate = safeConvertDate(task.dueDate);
        if (dueDate) task.dueDate = dueDate;
      }
      
      const createdAt = safeConvertDate(task.createdAt);
      if (createdAt) task.createdAt = createdAt;
      
      const updatedAt = safeConvertDate(task.updatedAt);
      if (updatedAt) task.updatedAt = updatedAt;
      
      if (task.completedAt) {
        const completedAt = safeConvertDate(task.completedAt);
        if (completedAt) task.completedAt = completedAt;
      }
    });

    // Convert appointment dates
    data.appointments?.forEach((appointment: any) => {
      const appointmentDate = safeConvertDate(appointment.appointmentDate);
      if (appointmentDate) appointment.appointmentDate = appointmentDate;
      
      const createdAt = safeConvertDate(appointment.createdAt);
      if (createdAt) appointment.createdAt = createdAt;
      
      const updatedAt = safeConvertDate(appointment.updatedAt);
      if (updatedAt) appointment.updatedAt = updatedAt;
    });

    // Convert client dates
    data.clients?.forEach((client: any) => {
      const createdAt = safeConvertDate(client.createdAt);
      if (createdAt) client.createdAt = createdAt;
      
      const updatedAt = safeConvertDate(client.updatedAt);
      if (updatedAt) client.updatedAt = updatedAt;
    });

    // Convert case dates
    data.cases?.forEach((case_: any) => {
      const createdAt = safeConvertDate(case_.createdAt);
      if (createdAt) case_.createdAt = createdAt;
      
      const updatedAt = safeConvertDate(case_.updatedAt);
      if (updatedAt) case_.updatedAt = updatedAt;
    });

    // Convert stage dates
    data.stages?.forEach((stage: any) => {
      const firstSessionDate = safeConvertDate(stage.firstSessionDate);
      if (firstSessionDate) stage.firstSessionDate = firstSessionDate;
      
      if (stage.resolutionDate) {
        const resolutionDate = safeConvertDate(stage.resolutionDate);
        if (resolutionDate) stage.resolutionDate = resolutionDate;
      }
      
      const createdAt = safeConvertDate(stage.createdAt);
      if (createdAt) stage.createdAt = createdAt;
      
      const updatedAt = safeConvertDate(stage.updatedAt);
      if (updatedAt) stage.updatedAt = updatedAt;
    });
  }

  private saveData(data: any) {
    try {
      data.lastModified = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      this.cache = data;
    } catch (error) {
      console.error('Error saving data to storage:', error);
      throw new Error('فشل في حفظ البيانات. تأكد من وجود مساحة كافية في التخزين.');
    }
  }

  // Session methods
  getSessions(): Session[] {
    return this.getData().sessions;
  }

  addSession(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Session {
    const data = this.getData();
    const newSession: Session = {
      ...session,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    data.sessions.push(newSession);
    this.saveData(data);
    return newSession;
  }

  updateSession(id: string, updates: Partial<Session>): Session | null {
    const data = this.getData();
    const sessionIndex = data.sessions.findIndex(s => s.id === id);
    if (sessionIndex === -1) return null;

    data.sessions[sessionIndex] = {
      ...data.sessions[sessionIndex],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveData(data);
    return data.sessions[sessionIndex];
  }

  deleteSession(id: string): boolean {
    const data = this.getData();
    const sessionIndex = data.sessions.findIndex(s => s.id === id);
    if (sessionIndex === -1) return false;

    data.sessions.splice(sessionIndex, 1);
    this.saveData(data);
    return true;
  }

  resolveSession(sessionId: string): Session | null {
    const data = this.getData();
    const session = data.sessions.find(s => s.id === sessionId);
    if (!session) return null;

    session.isResolved = true;
    session.resolutionDate = new Date();
    session.updatedAt = new Date();

    this.saveData(data);
    return session;
  }

  transferSession(sessionId: string, nextDate: Date, reason: string): Session | null {
    const data = this.getData();
    const session = data.sessions.find(s => s.id === sessionId);
    if (!session) return null;

    // Update current session with next session info
    session.nextSessionDate = nextDate;
    session.nextPostponementReason = reason;
    session.isTransferred = true;
    session.updatedAt = new Date();

    // Create new session for the next date
    const newSession: Session = {
      id: crypto.randomUUID(),
      stageId: session.stageId,
      courtName: session.courtName,
      caseNumber: session.caseNumber,
      sessionDate: nextDate,
      clientName: session.clientName,
      opponent: session.opponent,
      isTransferred: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    data.sessions.push(newSession);
    this.saveData(data);
    return newSession;
  }

  // Task methods
  getTasks(): Task[] {
    return this.getData().tasks;
  }

  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const data = this.getData();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    data.tasks.push(newTask);
    this.saveData(data);
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): Task | null {
    const data = this.getData();
    const taskIndex = data.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return null;

    data.tasks[taskIndex] = {
      ...data.tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveData(data);
    return data.tasks[taskIndex];
  }

  deleteTask(id: string): boolean {
    const data = this.getData();
    const taskIndex = data.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return false;

    data.tasks.splice(taskIndex, 1);
    this.saveData(data);
    return true;
  }

  // Appointment methods
  getAppointments(): Appointment[] {
    return this.getData().appointments;
  }

  addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Appointment {
    const data = this.getData();
    const newAppointment: Appointment = {
      ...appointment,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    data.appointments.push(newAppointment);
    this.saveData(data);
    return newAppointment;
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
    const data = this.getData();
    const appointmentIndex = data.appointments.findIndex(a => a.id === id);
    if (appointmentIndex === -1) return null;

    data.appointments[appointmentIndex] = {
      ...data.appointments[appointmentIndex],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveData(data);
    return data.appointments[appointmentIndex];
  }

  deleteAppointment(id: string): boolean {
    const data = this.getData();
    const appointmentIndex = data.appointments.findIndex(a => a.id === id);
    if (appointmentIndex === -1) return false;

    data.appointments.splice(appointmentIndex, 1);
    this.saveData(data);
    return true;
  }

  // Client methods
  getClients(): Client[] {
    return this.getData().clients;
  }

  addClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client {
    const data = this.getData();
    const newClient: Client = {
      ...client,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    data.clients.push(newClient);
    this.saveData(data);
    return newClient;
  }

  updateClient(id: string, updates: Partial<Client>): Client | null {
    const data = this.getData();
    const clientIndex = data.clients.findIndex(c => c.id === id);
    if (clientIndex === -1) return null;

    data.clients[clientIndex] = {
      ...data.clients[clientIndex],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveData(data);
    return data.clients[clientIndex];
  }

  deleteClient(id: string): boolean {
    const data = this.getData();
    const clientIndex = data.clients.findIndex(c => c.id === id);
    if (clientIndex === -1) return false;

    data.clients.splice(clientIndex, 1);
    this.saveData(data);
    return true;
  }

  // Case methods
  getCases(): Case[] {
    return this.getData().cases;
  }

  addCase(case_: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Case {
    const data = this.getData();
    const newCase: Case = {
      ...case_,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    data.cases.push(newCase);
    this.saveData(data);
    return newCase;
  }

  updateCase(id: string, updates: Partial<Case>): Case | null {
    const data = this.getData();
    const caseIndex = data.cases.findIndex(c => c.id === id);
    if (caseIndex === -1) return null;

    data.cases[caseIndex] = {
      ...data.cases[caseIndex],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveData(data);
    return data.cases[caseIndex];
  }

  deleteCase(id: string): boolean {
    const data = this.getData();
    const caseIndex = data.cases.findIndex(c => c.id === id);
    if (caseIndex === -1) return false;

    data.cases.splice(caseIndex, 1);
    this.saveData(data);
    return true;
  }

  // Stage methods
  getStages(): CaseStage[] {
    return this.getData().stages;
  }

  addStage(stage: Omit<CaseStage, 'id' | 'createdAt' | 'updatedAt'>): CaseStage {
    const data = this.getData();
    const newStage: CaseStage = {
      ...stage,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    data.stages.push(newStage);
    this.saveData(data);
    return newStage;
  }

  updateStage(id: string, updates: Partial<CaseStage>): CaseStage | null {
    const data = this.getData();
    const stageIndex = data.stages.findIndex(s => s.id === id);
    if (stageIndex === -1) return null;

    data.stages[stageIndex] = {
      ...data.stages[stageIndex],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveData(data);
    return data.stages[stageIndex];
  }

  deleteStage(id: string): boolean {
    const data = this.getData();
    const stageIndex = data.stages.findIndex(s => s.id === id);
    if (stageIndex === -1) return false;

    data.stages.splice(stageIndex, 1);
    this.saveData(data);
    return true;
  }

  // Case Fee methods
  getCaseFees(): CaseFee[] {
    return this.getData().caseFees;
  }

  addCaseFee(fee: Omit<CaseFee, 'id' | 'createdAt' | 'updatedAt'>): CaseFee {
    const data = this.getData();
    const newFee: CaseFee = {
      ...fee,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    data.caseFees.push(newFee);
    this.saveData(data);
    return newFee;
  }

  updateCaseFee(id: string, updates: Partial<CaseFee>): CaseFee | null {
    const data = this.getData();
    const feeIndex = data.caseFees.findIndex(f => f.id === id);
    if (feeIndex === -1) return null;

    data.caseFees[feeIndex] = {
      ...data.caseFees[feeIndex],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveData(data);
    return data.caseFees[feeIndex];
  }

  deleteCaseFee(id: string): boolean {
    const data = this.getData();
    const feeIndex = data.caseFees.findIndex(f => f.id === id);
    if (feeIndex === -1) return false;

    data.caseFees.splice(feeIndex, 1);
    this.saveData(data);
    return true;
  }

  // Payment methods
  getPayments(): Payment[] {
    return this.getData().payments;
  }

  addPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Payment {
    const data = this.getData();
    const newPayment: Payment = {
      ...payment,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    data.payments.push(newPayment);
    this.saveData(data);
    return newPayment;
  }

  updatePayment(id: string, updates: Partial<Payment>): Payment | null {
    const data = this.getData();
    const paymentIndex = data.payments.findIndex(p => p.id === id);
    if (paymentIndex === -1) return null;

    data.payments[paymentIndex] = {
      ...data.payments[paymentIndex],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveData(data);
    return data.payments[paymentIndex];
  }

  deletePayment(id: string): boolean {
    const data = this.getData();
    const paymentIndex = data.payments.findIndex(p => p.id === id);
    if (paymentIndex === -1) return false;

    data.payments.splice(paymentIndex, 1);
    this.saveData(data);
    return true;
  }

  // Expense methods
  getExpenses(): Expense[] {
    return this.getData().expenses;
  }

  addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Expense {
    const data = this.getData();
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    data.expenses.push(newExpense);
    this.saveData(data);
    return newExpense;
  }

  updateExpense(id: string, updates: Partial<Expense>): Expense | null {
    const data = this.getData();
    const expenseIndex = data.expenses.findIndex(e => e.id === id);
    if (expenseIndex === -1) return null;

    data.expenses[expenseIndex] = {
      ...data.expenses[expenseIndex],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveData(data);
    return data.expenses[expenseIndex];
  }

  deleteExpense(id: string): boolean {
    const data = this.getData();
    const expenseIndex = data.expenses.findIndex(e => e.id === id);
    if (expenseIndex === -1) return false;

    data.expenses.splice(expenseIndex, 1);
    this.saveData(data);
    return true;
  }

  // Accounting calculation methods
  getCaseAccountSummary(caseId: string): CaseAccountSummary {
    const fees = this.getCaseFees().filter(f => f.caseId === caseId);
    const payments = this.getPayments().filter(p => p.caseId === caseId);
    const expenses = this.getExpenses().filter(e => e.caseId === caseId);

    const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const reimbursableExpenses = expenses
      .filter(e => e.isReimbursable && !e.isReimbursed)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const unreimbursedExpenses = expenses
      .filter(e => e.isReimbursable && !e.isReimbursed)
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      caseId,
      totalFees,
      totalPayments,
      totalExpenses,
      balance: totalPayments - totalFees - totalExpenses,
      reimbursableExpenses,
      unreimbursedExpenses,
    };
  }

  getClientAccountSummary(clientId: string): ClientAccountSummary {
    const clientCases = this.getCases().filter(c => c.clientId === clientId);
    const caseSummaries = clientCases.map(c => this.getCaseAccountSummary(c.id));

    const totalFees = caseSummaries.reduce((sum, cs) => sum + cs.totalFees, 0);
    const totalPayments = caseSummaries.reduce((sum, cs) => sum + cs.totalPayments, 0);
    const totalExpenses = caseSummaries.reduce((sum, cs) => sum + cs.totalExpenses, 0);

    return {
      clientId,
      totalFees,
      totalPayments,
      totalExpenses,
      balance: totalPayments - totalFees - totalExpenses,
      caseSummaries,
    };
  }

  // Backup and restore methods
  exportData(): string {
    const data = this.getData();
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.convertDates(data);
      this.saveData(data);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data
  clearAllData(): void {
    localStorage.removeItem(this.storageKey);
    this.cache = { ...this.defaultData };
  }
}

export const dataStore = new DataStore();

// Initialize the store when the module is loaded
dataStore.initialize();

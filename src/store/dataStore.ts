import { Client, Case, CaseStage, Session, Task, Appointment, ClientFee, ClientPayment, ClientExpense, OfficeIncome, OfficeExpense, ClientBalance } from '@/types';

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
    clientFees: [] as ClientFee[],
    clientPayments: [] as ClientPayment[],
    clientExpenses: [] as ClientExpense[],
    officeIncome: [] as OfficeIncome[],
    officeExpenses: [] as OfficeExpense[],
    version: '1.0.0',
  };

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
    const safeConvertDate = (dateValue: any): Date | null => {
      if (!dateValue) return null;
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date;
    };

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

    data.appointments?.forEach((appointment: any) => {
      const appointmentDate = safeConvertDate(appointment.appointmentDate);
      if (appointmentDate) appointment.appointmentDate = appointmentDate;
      
      const createdAt = safeConvertDate(appointment.createdAt);
      if (createdAt) appointment.createdAt = createdAt;
      
      const updatedAt = safeConvertDate(appointment.updatedAt);
      if (updatedAt) appointment.updatedAt = updatedAt;
    });

    data.clients?.forEach((client: any) => {
      const createdAt = safeConvertDate(client.createdAt);
      if (createdAt) client.createdAt = createdAt;
      
      const updatedAt = safeConvertDate(client.updatedAt);
      if (updatedAt) client.updatedAt = updatedAt;
    });

    data.cases?.forEach((case_: any) => {
      const createdAt = safeConvertDate(case_.createdAt);
      if (createdAt) case_.createdAt = createdAt;
      
      const updatedAt = safeConvertDate(case_.updatedAt);
      if (updatedAt) case_.updatedAt = updatedAt;
    });

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

    data.clientFees?.forEach((fee: any) => {
      const feeDate = safeConvertDate(fee.feeDate);
      if (feeDate) fee.feeDate = feeDate;
      
      const createdAt = safeConvertDate(fee.createdAt);
      if (createdAt) fee.createdAt = createdAt;
      
      const updatedAt = safeConvertDate(fee.updatedAt);
      if (updatedAt) fee.updatedAt = updatedAt;
    });

    data.clientPayments?.forEach((payment: any) => {
      const paymentDate = safeConvertDate(payment.paymentDate);
      if (paymentDate) payment.paymentDate = paymentDate;
      
      const createdAt = safeConvertDate(payment.createdAt);
      if (createdAt) payment.createdAt = createdAt;
      
      const updatedAt = safeConvertDate(payment.updatedAt);
      if (updatedAt) payment.updatedAt = updatedAt;
    });

    data.clientExpenses?.forEach((expense: any) => {
      const expenseDate = safeConvertDate(expense.expenseDate);
      if (expenseDate) expense.expenseDate = expenseDate;
      
      const createdAt = safeConvertDate(expense.createdAt);
      if (createdAt) expense.createdAt = createdAt;
      
      const updatedAt = safeConvertDate(expense.updatedAt);
      if (updatedAt) expense.updatedAt = updatedAt;
    });

    data.officeIncome?.forEach((income: any) => {
      const incomeDate = safeConvertDate(income.incomeDate);
      if (incomeDate) income.incomeDate = incomeDate;
      
      const createdAt = safeConvertDate(income.createdAt);
      if (createdAt) income.createdAt = createdAt;
      
      const updatedAt = safeConvertDate(income.updatedAt);
      if (updatedAt) income.updatedAt = updatedAt;
    });

    data.officeExpenses?.forEach((expense: any) => {
      const expenseDate = safeConvertDate(expense.expenseDate);
      if (expenseDate) expense.expenseDate = expenseDate;
      
      const createdAt = safeConvertDate(expense.createdAt);
      if (createdAt) expense.createdAt = createdAt;
      
      const updatedAt = safeConvertDate(expense.updatedAt);
      if (updatedAt) expense.updatedAt = updatedAt;
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

    session.nextSessionDate = nextDate;
    session.nextPostponementReason = reason;
    session.isTransferred = true;
    session.updatedAt = new Date();

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

  getClientFees(clientId?: string): ClientFee[] {
    const fees = this.getData().clientFees;
    return clientId ? fees.filter(fee => fee.clientId === clientId) : fees;
  }

  addClientFee(fee: Omit<ClientFee, 'id' | 'createdAt' | 'updatedAt'>): ClientFee {
    const data = this.getData();
    const newFee: ClientFee = {
      ...fee,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    data.clientFees.push(newFee);
    this.saveData(data);
    return newFee;
  }

  updateClientFee(id: string, updates: Partial<ClientFee>): ClientFee | null {
    const data = this.getData();
    const feeIndex = data.clientFees.findIndex(f => f.id === id);
    if (feeIndex === -1) return null;

    data.clientFees[feeIndex] = {
      ...data.clientFees[feeIndex],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveData(data);
    return data.clientFees[feeIndex];
  }

  deleteClientFee(id: string): boolean {
    const data = this.getData();
    const feeIndex = data.clientFees.findIndex(f => f.id === id);
    if (feeIndex === -1) return false;

    data.clientFees.splice(feeIndex, 1);
    this.saveData(data);
    return true;
  }

  getClientPayments(clientId?: string): ClientPayment[] {
    const payments = this.getData().clientPayments;
    return clientId ? payments.filter(payment => payment.clientId === clientId) : payments;
  }

  addClientPayment(payment: Omit<ClientPayment, 'id' | 'createdAt' | 'updatedAt'>): ClientPayment {
    const data = this.getData();
    const newPayment: ClientPayment = {
      ...payment,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    data.clientPayments.push(newPayment);
    this.saveData(data);
    return newPayment;
  }

  updateClientPayment(id: string, updates: Partial<ClientPayment>): ClientPayment | null {
    const data = this.getData();
    const paymentIndex = data.clientPayments.findIndex(p => p.id === id);
    if (paymentIndex === -1) return null;

    data.clientPayments[paymentIndex] = {
      ...data.clientPayments[paymentIndex],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveData(data);
    return data.clientPayments[paymentIndex];
  }

  deleteClientPayment(id: string): boolean {
    const data = this.getData();
    const paymentIndex = data.clientPayments.findIndex(p => p.id === id);
    if (paymentIndex === -1) return false;

    data.clientPayments.splice(paymentIndex, 1);
    this.saveData(data);
    return true;
  }

  getClientExpenses(clientId?: string): ClientExpense[] {
    const expenses = this.getData().clientExpenses;
    return clientId ? expenses.filter(expense => expense.clientId === clientId) : expenses;
  }

  addClientExpense(expense: Omit<ClientExpense, 'id' | 'createdAt' | 'updatedAt'>): ClientExpense {
    const data = this.getData();
    const newExpense: ClientExpense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    data.clientExpenses.push(newExpense);
    this.saveData(data);
    return newExpense;
  }

  updateClientExpense(id: string, updates: Partial<ClientExpense>): ClientExpense | null {
    const data = this.getData();
    const expenseIndex = data.clientExpenses.findIndex(e => e.id === id);
    if (expenseIndex === -1) return null;

    data.clientExpenses[expenseIndex] = {
      ...data.clientExpenses[expenseIndex],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveData(data);
    return data.clientExpenses[expenseIndex];
  }

  deleteClientExpense(id: string): boolean {
    const data = this.getData();
    const expenseIndex = data.clientExpenses.findIndex(e => e.id === id);
    if (expenseIndex === -1) return false;

    data.clientExpenses.splice(expenseIndex, 1);
    this.saveData(data);
    return true;
  }

  getOfficeIncome(): OfficeIncome[] {
    return this.getData().officeIncome;
  }

  addOfficeIncome(income: Omit<OfficeIncome, 'id' | 'createdAt' | 'updatedAt'>): OfficeIncome {
    const data = this.getData();
    const newIncome: OfficeIncome = {
      ...income,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    data.officeIncome.push(newIncome);
    this.saveData(data);
    return newIncome;
  }

  updateOfficeIncome(id: string, updates: Partial<OfficeIncome>): OfficeIncome | null {
    const data = this.getData();
    const incomeIndex = data.officeIncome.findIndex(i => i.id === id);
    if (incomeIndex === -1) return null;

    data.officeIncome[incomeIndex] = {
      ...data.officeIncome[incomeIndex],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveData(data);
    return data.officeIncome[incomeIndex];
  }

  deleteOfficeIncome(id: string): boolean {
    const data = this.getData();
    const incomeIndex = data.officeIncome.findIndex(i => i.id === id);
    if (incomeIndex === -1) return false;

    data.officeIncome.splice(incomeIndex, 1);
    this.saveData(data);
    return true;
  }

  getOfficeExpenses(): OfficeExpense[] {
    return this.getData().officeExpenses;
  }

  addOfficeExpense(expense: Omit<OfficeExpense, 'id' | 'createdAt' | 'updatedAt'>): OfficeExpense {
    const data = this.getData();
    const newExpense: OfficeExpense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    data.officeExpenses.push(newExpense);
    this.saveData(data);
    return newExpense;
  }

  updateOfficeExpense(id: string, updates: Partial<OfficeExpense>): OfficeExpense | null {
    const data = this.getData();
    const expenseIndex = data.officeExpenses.findIndex(e => e.id === id);
    if (expenseIndex === -1) return null;

    data.officeExpenses[expenseIndex] = {
      ...data.officeExpenses[expenseIndex],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveData(data);
    return data.officeExpenses[expenseIndex];
  }

  deleteOfficeExpense(id: string): boolean {
    const data = this.getData();
    const expenseIndex = data.officeExpenses.findIndex(e => e.id === id);
    if (expenseIndex === -1) return false;

    data.officeExpenses.splice(expenseIndex, 1);
    this.saveData(data);
    return true;
  }

  getClientBalance(clientId: string): ClientBalance {
    const fees = this.getClientFees(clientId);
    const payments = this.getClientPayments(clientId);
    const expenses = this.getClientExpenses(clientId);

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

  clearAllData(): void {
    localStorage.removeItem(this.storageKey);
    this.cache = { ...this.defaultData };
  }
}

export const dataStore = new DataStore();

dataStore.initialize();

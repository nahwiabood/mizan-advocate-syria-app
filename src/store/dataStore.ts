import { Client, Case, CaseStage, Session, Task, Appointment, ClientFee, ClientPayment, ClientExpense, OfficeIncome, OfficeExpense, ClientBalance } from '@/types';
import { supabaseStore } from './supabaseStore';

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

  // All methods now delegate to supabaseStore
  getSessions(): Promise<Session[]> {
    return supabaseStore.getSessions();
  }

  addSession(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> {
    return supabaseStore.addSession(session);
  }

  updateSession(id: string, updates: Partial<Session>): Promise<Session | null> {
    return supabaseStore.updateSession(id, updates);
  }

  deleteSession(id: string): Promise<boolean> {
    return supabaseStore.deleteSession(id);
  }

  resolveSession(sessionId: string): Promise<Session | null> {
    return supabaseStore.resolveSession(sessionId);
  }

  transferSession(sessionId: string, nextDate: Date, reason: string): Promise<Session | null> {
    return supabaseStore.transferSession(sessionId, nextDate, reason);
  }

  getTasks(): Promise<Task[]> {
    return supabaseStore.getTasks();
  }

  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    return supabaseStore.addTask(task);
  }

  updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    return supabaseStore.updateTask(id, updates);
  }

  deleteTask(id: string): Promise<boolean> {
    return supabaseStore.deleteTask(id);
  }

  getAppointments(): Promise<Appointment[]> {
    return supabaseStore.getAppointments();
  }

  addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    return supabaseStore.addAppointment(appointment);
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    return supabaseStore.updateAppointment(id, updates);
  }

  deleteAppointment(id: string): Promise<boolean> {
    return supabaseStore.deleteAppointment(id);
  }

  getClients(): Promise<Client[]> {
    return supabaseStore.getClients();
  }

  addClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    return supabaseStore.addClient(client);
  }

  updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    return supabaseStore.updateClient(id, updates);
  }

  deleteClient(id: string): Promise<boolean> {
    return supabaseStore.deleteClient(id);
  }

  getCases(): Promise<Case[]> {
    return supabaseStore.getCases();
  }

  addCase(case_: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Promise<Case> {
    return supabaseStore.addCase(case_);
  }

  updateCase(id: string, updates: Partial<Case>): Promise<Case | null> {
    return supabaseStore.updateCase(id, updates);
  }

  deleteCase(id: string): Promise<boolean> {
    return supabaseStore.deleteCase(id);
  }

  getStages(): Promise<CaseStage[]> {
    return supabaseStore.getStages();
  }

  addStage(stage: Omit<CaseStage, 'id' | 'createdAt' | 'updatedAt'>): Promise<CaseStage> {
    return supabaseStore.addStage(stage);
  }

  updateStage(id: string, updates: Partial<CaseStage>): Promise<CaseStage | null> {
    return supabaseStore.updateStage(id, updates);
  }

  deleteStage(id: string): Promise<boolean> {
    return supabaseStore.deleteStage(id);
  }

  getClientFees(clientId?: string): Promise<ClientFee[]> {
    return supabaseStore.getClientFees(clientId);
  }

  addClientFee(fee: Omit<ClientFee, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientFee> {
    return supabaseStore.addClientFee(fee);
  }

  updateClientFee(id: string, updates: Partial<ClientFee>): Promise<ClientFee | null> {
    return supabaseStore.updateClientFee(id, updates);
  }

  deleteClientFee(id: string): Promise<boolean> {
    return supabaseStore.deleteClientFee(id);
  }

  getClientPayments(clientId?: string): Promise<ClientPayment[]> {
    return supabaseStore.getClientPayments(clientId);
  }

  addClientPayment(payment: Omit<ClientPayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientPayment> {
    return supabaseStore.addClientPayment(payment);
  }

  updateClientPayment(id: string, updates: Partial<ClientPayment>): Promise<ClientPayment | null> {
    return supabaseStore.updateClientPayment(id, updates);
  }

  deleteClientPayment(id: string): Promise<boolean> {
    return supabaseStore.deleteClientPayment(id);
  }

  getClientExpenses(clientId?: string): Promise<ClientExpense[]> {
    return supabaseStore.getClientExpenses(clientId);
  }

  addClientExpense(expense: Omit<ClientExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientExpense> {
    return supabaseStore.addClientExpense(expense);
  }

  updateClientExpense(id: string, updates: Partial<ClientExpense>): Promise<ClientExpense | null> {
    return supabaseStore.updateClientExpense(id, updates);
  }

  deleteClientExpense(id: string): Promise<boolean> {
    return supabaseStore.deleteClientExpense(id);
  }

  getOfficeIncome(): Promise<OfficeIncome[]> {
    return supabaseStore.getOfficeIncome();
  }

  addOfficeIncome(income: Omit<OfficeIncome, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeIncome> {
    return supabaseStore.addOfficeIncome(income);
  }

  updateOfficeIncome(id: string, updates: Partial<OfficeIncome>): Promise<OfficeIncome | null> {
    return supabaseStore.updateOfficeIncome(id, updates);
  }

  deleteOfficeIncome(id: string): Promise<boolean> {
    return supabaseStore.deleteOfficeIncome(id);
  }

  getOfficeExpenses(): Promise<OfficeExpense[]> {
    return supabaseStore.getOfficeExpenses();
  }

  addOfficeExpense(expense: Omit<OfficeExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeExpense> {
    return supabaseStore.addOfficeExpense(expense);
  }

  updateOfficeExpense(id: string, updates: Partial<OfficeExpense>): Promise<OfficeExpense | null> {
    return supabaseStore.updateOfficeExpense(id, updates);
  }

  deleteOfficeExpense(id: string): Promise<boolean> {
    return supabaseStore.deleteOfficeExpense(id);
  }

  getClientBalance(clientId: string): Promise<ClientBalance> {
    return supabaseStore.getClientBalance(clientId);
  }

  exportData(): Promise<string> {
    return supabaseStore.exportData();
  }

  importData(jsonData: string): Promise<boolean> {
    return supabaseStore.importData(jsonData);
  }

  clearAllData(): Promise<void> {
    return supabaseStore.clearAllData();
  }
}

export const dataStore = new DataStore();

dataStore.initialize();

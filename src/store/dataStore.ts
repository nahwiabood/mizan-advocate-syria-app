
import { supabaseStore } from './supabaseStore';
import { Client, Case, CaseStage, Session, Task, Appointment, ClientFee, ClientPayment, ClientExpense, OfficeIncome, OfficeExpense, ClientBalance } from '@/types';

class DataStore {
  private isInitialized = false;

  initialize() {
    if (!this.isInitialized) {
      this.isInitialized = true;
    }
  }

  // Sessions
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

  // Tasks
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

  // Appointments
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

  // Clients
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

  // Cases
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

  // Stages
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

  // Client Fees
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

  // Client Payments
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

  // Client Expenses
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

  // Office Income
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

  // Office Expenses
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

  // Client Balance
  getClientBalance(clientId: string): Promise<ClientBalance> {
    return supabaseStore.getClientBalance(clientId);
  }

  // Export/Import
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

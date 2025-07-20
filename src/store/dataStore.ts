
import { Client, Case, CaseStage, Session, Task, Appointment, ClientFee, ClientPayment, ClientExpense, OfficeIncome, OfficeExpense, ClientBalance } from '@/types';
import { supabaseStore } from './supabaseStore';

class DataStore {
  private isInitialized = false;

  initialize() {
    if (!this.isInitialized) {
      this.isInitialized = true;
    }
  }

  getData() {
    // This method is kept for compatibility but not used with Supabase
    return {};
  }

  async getSessions(): Promise<Session[]> {
    return await supabaseStore.getSessions();
  }

  async addSession(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> {
    return await supabaseStore.addSession(session);
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | null> {
    return await supabaseStore.updateSession(id, updates);
  }

  async deleteSession(id: string): Promise<boolean> {
    return await supabaseStore.deleteSession(id);
  }

  async resolveSession(sessionId: string): Promise<Session | null> {
    return await supabaseStore.resolveSession(sessionId);
  }

  async transferSession(sessionId: string, nextDate: Date, reason: string): Promise<Session | null> {
    return await supabaseStore.transferSession(sessionId, nextDate, reason);
  }

  async getTasks(): Promise<Task[]> {
    return await supabaseStore.getTasks();
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    return await supabaseStore.addTask(task);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    return await supabaseStore.updateTask(id, updates);
  }

  async deleteTask(id: string): Promise<boolean> {
    return await supabaseStore.deleteTask(id);
  }

  async getAppointments(): Promise<Appointment[]> {
    return await supabaseStore.getAppointments();
  }

  async addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    return await supabaseStore.addAppointment(appointment);
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    return await supabaseStore.updateAppointment(id, updates);
  }

  async deleteAppointment(id: string): Promise<boolean> {
    return await supabaseStore.deleteAppointment(id);
  }

  async getClients(): Promise<Client[]> {
    return await supabaseStore.getClients();
  }

  async addClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    return await supabaseStore.addClient(client);
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    return await supabaseStore.updateClient(id, updates);
  }

  async deleteClient(id: string): Promise<boolean> {
    return await supabaseStore.deleteClient(id);
  }

  async getCases(): Promise<Case[]> {
    return await supabaseStore.getCases();
  }

  async addCase(case_: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Promise<Case> {
    return await supabaseStore.addCase(case_);
  }

  async updateCase(id: string, updates: Partial<Case>): Promise<Case | null> {
    return await supabaseStore.updateCase(id, updates);
  }

  async deleteCase(id: string): Promise<boolean> {
    return await supabaseStore.deleteCase(id);
  }

  async getStages(): Promise<CaseStage[]> {
    return await supabaseStore.getStages();
  }

  async addStage(stage: Omit<CaseStage, 'id' | 'createdAt' | 'updatedAt'>): Promise<CaseStage> {
    return await supabaseStore.addStage(stage);
  }

  async updateStage(id: string, updates: Partial<CaseStage>): Promise<CaseStage | null> {
    return await supabaseStore.updateStage(id, updates);
  }

  async deleteStage(id: string): Promise<boolean> {
    return await supabaseStore.deleteStage(id);
  }

  async getClientFees(clientId?: string): Promise<ClientFee[]> {
    return await supabaseStore.getClientFees(clientId);
  }

  async addClientFee(fee: Omit<ClientFee, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientFee> {
    return await supabaseStore.addClientFee(fee);
  }

  async updateClientFee(id: string, updates: Partial<ClientFee>): Promise<ClientFee | null> {
    return await supabaseStore.updateClientFee(id, updates);
  }

  async deleteClientFee(id: string): Promise<boolean> {
    return await supabaseStore.deleteClientFee(id);
  }

  async getClientPayments(clientId?: string): Promise<ClientPayment[]> {
    return await supabaseStore.getClientPayments(clientId);
  }

  async addClientPayment(payment: Omit<ClientPayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientPayment> {
    return await supabaseStore.addClientPayment(payment);
  }

  async updateClientPayment(id: string, updates: Partial<ClientPayment>): Promise<ClientPayment | null> {
    return await supabaseStore.updateClientPayment(id, updates);
  }

  async deleteClientPayment(id: string): Promise<boolean> {
    return await supabaseStore.deleteClientPayment(id);
  }

  async getClientExpenses(clientId?: string): Promise<ClientExpense[]> {
    return await supabaseStore.getClientExpenses(clientId);
  }

  async addClientExpense(expense: Omit<ClientExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientExpense> {
    return await supabaseStore.addClientExpense(expense);
  }

  async updateClientExpense(id: string, updates: Partial<ClientExpense>): Promise<ClientExpense | null> {
    return await supabaseStore.updateClientExpense(id, updates);
  }

  async deleteClientExpense(id: string): Promise<boolean> {
    return await supabaseStore.deleteClientExpense(id);
  }

  async getOfficeIncome(): Promise<OfficeIncome[]> {
    return await supabaseStore.getOfficeIncome();
  }

  async addOfficeIncome(income: Omit<OfficeIncome, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeIncome> {
    return await supabaseStore.addOfficeIncome(income);
  }

  async updateOfficeIncome(id: string, updates: Partial<OfficeIncome>): Promise<OfficeIncome | null> {
    return await supabaseStore.updateOfficeIncome(id, updates);
  }

  async deleteOfficeIncome(id: string): Promise<boolean> {
    return await supabaseStore.deleteOfficeIncome(id);
  }

  async getOfficeExpenses(): Promise<OfficeExpense[]> {
    return await supabaseStore.getOfficeExpenses();
  }

  async addOfficeExpense(expense: Omit<OfficeExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeExpense> {
    return await supabaseStore.addOfficeExpense(expense);
  }

  async updateOfficeExpense(id: string, updates: Partial<OfficeExpense>): Promise<OfficeExpense | null> {
    return await supabaseStore.updateOfficeExpense(id, updates);
  }

  async deleteOfficeExpense(id: string): Promise<boolean> {
    return await supabaseStore.deleteOfficeExpense(id);
  }

  async getClientBalance(clientId: string): Promise<ClientBalance> {
    return await supabaseStore.getClientBalance(clientId);
  }

  async exportData(): Promise<string> {
    return await supabaseStore.exportData();
  }

  async importData(jsonData: string): Promise<boolean> {
    return await supabaseStore.importData(jsonData);
  }

  async clearAllData(): Promise<void> {
    return await supabaseStore.clearAllData();
  }
}

export const dataStore = new DataStore();

dataStore.initialize();

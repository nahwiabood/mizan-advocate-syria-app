import { Client, Case, CaseStage, Session, Task, Appointment } from '@/types';

class DataStore {
  private storageKey = 'lawyer-management-data';

  private defaultData = {
    clients: [] as Client[],
    cases: [] as Case[],
    stages: [] as CaseStage[],
    sessions: [] as Session[],
    tasks: [] as Task[],
    appointments: [] as Appointment[],
  };

  getData() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      const data = JSON.parse(stored);
      // Convert date strings back to Date objects
      this.convertDates(data);
      return data;
    }
    return this.defaultData;
  }

  private convertDates(data: any) {
    // Convert session dates
    data.sessions?.forEach((session: any) => {
      session.sessionDate = new Date(session.sessionDate);
      if (session.nextSessionDate) session.nextSessionDate = new Date(session.nextSessionDate);
      session.createdAt = new Date(session.createdAt);
      session.updatedAt = new Date(session.updatedAt);
    });

    // Convert task dates
    data.tasks?.forEach((task: any) => {
      task.dueDate = new Date(task.dueDate);
      task.createdAt = new Date(task.createdAt);
      task.updatedAt = new Date(task.updatedAt);
      if (task.completedAt) task.completedAt = new Date(task.completedAt);
    });

    // Convert appointment dates
    data.appointments?.forEach((appointment: any) => {
      appointment.appointmentDate = new Date(appointment.appointmentDate);
      appointment.createdAt = new Date(appointment.createdAt);
      appointment.updatedAt = new Date(appointment.updatedAt);
    });

    // Convert client dates
    data.clients?.forEach((client: any) => {
      client.createdAt = new Date(client.createdAt);
      client.updatedAt = new Date(client.updatedAt);
    });

    // Convert case dates
    data.cases?.forEach((case_: any) => {
      case_.createdAt = new Date(case_.createdAt);
      case_.updatedAt = new Date(case_.updatedAt);
    });

    // Convert stage dates
    data.stages?.forEach((stage: any) => {
      stage.firstSessionDate = new Date(stage.firstSessionDate);
      stage.createdAt = new Date(stage.createdAt);
      stage.updatedAt = new Date(stage.updatedAt);
    });
  }

  saveData(data: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
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
}

export const dataStore = new DataStore();

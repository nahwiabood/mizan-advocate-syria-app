
export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  nationalId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Case {
  id: string;
  clientId: string;
  title: string;
  description: string;
  opponent: string;
  subject: string; // Added subject property
  caseType: string;
  status: 'active' | 'closed' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface CaseStage {
  id: string;
  caseId: string;
  courtName: string;
  caseNumber: string;
  stageName: string; // Added stageName property
  firstSessionDate: Date;
  status: 'active' | 'completed';
  notes?: string;
  // New fields for resolution
  isResolved?: boolean;
  resolutionDate?: Date;
  decisionNumber?: string;
  decisionResult?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  stageId: string;
  courtName: string;
  caseNumber: string;
  sessionDate: Date;
  clientName: string;
  opponent: string;
  postponementReason?: string;
  nextSessionDate?: Date;
  nextPostponementReason?: string;
  isTransferred: boolean;
  // New field for resolution
  isResolved?: boolean;
  resolutionDate?: Date;
  decisionNumber?: string;
  decisionResult?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  appointmentDate: Date;
  time?: string;
  duration: number; // in minutes
  clientName?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DayData {
  date: Date;
  sessions: Session[];
  appointments: Appointment[];
  tasks: Task[];
}

// Add the Stage type alias for backward compatibility
export type Stage = CaseStage;

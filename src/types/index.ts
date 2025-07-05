
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

// New accounting-related interfaces
export interface CaseFee {
  id: string;
  caseId: string;
  amount: number;
  description: string;
  type: 'consultation' | 'representation' | 'court_appearance' | 'document_preparation' | 'other';
  dateSet: Date;
  isPaid: boolean;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  caseId: string;
  clientId: string;
  amount: number;
  description: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'other';
  paymentDate: Date;
  receiptNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  caseId: string;
  amount: number;
  description: string;
  type: 'court_fees' | 'document_fees' | 'travel' | 'communication' | 'other';
  expenseDate: Date;
  receiptNumber?: string;
  isReimbursable: boolean;
  isReimbursed?: boolean;
  reimbursedDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaseAccountSummary {
  caseId: string;
  totalFees: number;
  totalPayments: number;
  totalExpenses: number;
  balance: number;
  reimbursableExpenses: number;
  unreimbursedExpenses: number;
}

export interface ClientAccountSummary {
  clientId: string;
  totalFees: number;
  totalPayments: number;
  totalExpenses: number;
  balance: number;
  caseSummaries: CaseAccountSummary[];
}

// Add the Stage type alias for backward compatibility
export type Stage = CaseStage;

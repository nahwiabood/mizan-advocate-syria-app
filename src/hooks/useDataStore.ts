
import { useState, useEffect } from 'react';
import { dataStore } from '@/store/dataStore';
import { Client, Case, CaseStage, Session, Task, Appointment, CaseFee, Payment, Expense } from '@/types';

export const useDataStore = () => {
  const [data, setData] = useState(dataStore.getData());

  // Function to trigger re-render
  const refresh = () => {
    setData({ ...dataStore.getData() });
  };

  return {
    // Data getters
    clients: data.clients,
    cases: data.cases,
    stages: data.stages,
    sessions: data.sessions,
    tasks: data.tasks,
    appointments: data.appointments,
    caseFees: data.caseFees,
    payments: data.payments,
    expenses: data.expenses,

    // Client methods
    addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
      const result = dataStore.addClient(client);
      refresh();
      return result;
    },
    updateClient: (id: string, updates: Partial<Client>) => {
      const result = dataStore.updateClient(id, updates);
      refresh();
      return result;
    },
    deleteClient: (id: string) => {
      const result = dataStore.deleteClient(id);
      refresh();
      return result;
    },

    // Case methods
    addCase: (case_: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => {
      const result = dataStore.addCase(case_);
      refresh();
      return result;
    },
    updateCase: (id: string, updates: Partial<Case>) => {
      const result = dataStore.updateCase(id, updates);
      refresh();
      return result;
    },
    deleteCase: (id: string) => {
      const result = dataStore.deleteCase(id);
      refresh();
      return result;
    },

    // Stage methods
    addStage: (stage: Omit<CaseStage, 'id' | 'createdAt' | 'updatedAt'>) => {
      const result = dataStore.addStage(stage);
      refresh();
      return result;
    },
    updateStage: (id: string, updates: Partial<CaseStage>) => {
      const result = dataStore.updateStage(id, updates);
      refresh();
      return result;
    },
    deleteStage: (id: string) => {
      const result = dataStore.deleteStage(id);
      refresh();
      return result;
    },

    // Session methods
    addSession: (session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => {
      const result = dataStore.addSession(session);
      refresh();
      return result;
    },
    updateSession: (id: string, updates: Partial<Session>) => {
      const result = dataStore.updateSession(id, updates);
      refresh();
      return result;
    },
    deleteSession: (id: string) => {
      const result = dataStore.deleteSession(id);
      refresh();
      return result;
    },

    // Task methods
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      const result = dataStore.addTask(task);
      refresh();
      return result;
    },
    updateTask: (id: string, updates: Partial<Task>) => {
      const result = dataStore.updateTask(id, updates);
      refresh();
      return result;
    },
    deleteTask: (id: string) => {
      const result = dataStore.deleteTask(id);
      refresh();
      return result;
    },

    // Appointment methods
    addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
      const result = dataStore.addAppointment(apartment);
      refresh();
      return result;
    },
    updateAppointment: (id: string, updates: Partial<Appointment>) => {
      const result = dataStore.updateAppointment(id, updates);
      refresh();
      return result;
    },
    deleteAppointment: (id: string) => {
      const result = dataStore.deleteAppointment(id);
      refresh();
      return result;
    },

    // Accounting methods
    addCaseFee: (fee: Omit<CaseFee, 'id' | 'createdAt' | 'updatedAt'>) => {
      const result = dataStore.addCaseFee(fee);
      refresh();
      return result;
    },
    updateCaseFee: (id: string, updates: Partial<CaseFee>) => {
      const result = dataStore.updateCaseFee(id, updates);
      refresh();
      return result;
    },
    deleteCaseFee: (id: string) => {
      const result = dataStore.deleteCaseFee(id);
      refresh();
      return result;
    },

    addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
      const result = dataStore.addPayment(payment);
      refresh();
      return result;
    },
    updatePayment: (id: string, updates: Partial<Payment>) => {
      const result = dataStore.updatePayment(id, updates);
      refresh();
      return result;
    },
    deletePayment: (id: string) => {
      const result = dataStore.deletePayment(id);
      refresh();
      return result;
    },

    addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
      const result = dataStore.addExpense(expense);
      refresh();
      return result;
    },
    updateExpense: (id: string, updates: Partial<Expense>) => {
      const result = dataStore.updateExpense(id, updates);
      refresh();
      return result;
    },
    deleteExpense: (id: string) => {
      const result = dataStore.deleteExpense(id);
      refresh();
      return result;
    },

    // Utility methods
    getCaseAccountSummary: dataStore.getCaseAccountSummary.bind(dataStore),
    getClientAccountSummary: dataStore.getClientAccountSummary.bind(dataStore),
  };
};

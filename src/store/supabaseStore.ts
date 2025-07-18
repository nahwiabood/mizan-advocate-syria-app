
import { supabase } from '@/integrations/supabase/client';
import { Task, Appointment, Session, Client, Case, CaseStage, ClientFee, ClientPayment, ClientExpense, OfficeIncome, OfficeExpense } from '@/types';

class SupabaseStore {
  // Tasks methods
  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        due_date: task.dueDate?.toISOString().split('T')[0],
        priority: task.priority,
        is_completed: task.isCompleted,
        completed_at: task.completedAt?.toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTask(id: string, updates: Partial<Task>) {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString().split('T')[0];
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.isCompleted !== undefined) {
      updateData.is_completed = updates.isCompleted;
      updateData.completed_at = updates.isCompleted ? new Date().toISOString() : null;
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Appointments methods
  async addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        title: appointment.title,
        description: appointment.description,
        appointment_date: appointment.appointmentDate.toISOString().split('T')[0],
        time: appointment.time,
        location: appointment.location
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>) {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.appointmentDate !== undefined) updateData.appointment_date = updates.appointmentDate.toISOString().split('T')[0];
    if (updates.time !== undefined) updateData.time = updates.time;
    if (updates.location !== undefined) updateData.location = updates.location;

    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAppointment(id: string) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Sessions methods
  async addSession(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) {
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
        resolution_date: session.resolutionDate?.toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSession(id: string, updates: Partial<Session>) {
    const updateData: any = {};
    
    Object.keys(updates).forEach(key => {
      const value = updates[key as keyof Session];
      if (value !== undefined) {
        switch (key) {
          case 'sessionDate':
            updateData.session_date = (value as Date).toISOString().split('T')[0];
            break;
          case 'nextSessionDate':
            updateData.next_session_date = value ? (value as Date).toISOString().split('T')[0] : null;
            break;
          case 'resolutionDate':
            updateData.resolution_date = value ? (value as Date).toISOString().split('T')[0] : null;
            break;
          case 'stageId':
            updateData.stage_id = value;
            break;
          case 'courtName':
            updateData.court_name = value;
            break;
          case 'caseNumber':
            updateData.case_number = value;
            break;
          case 'clientName':
            updateData.client_name = value;
            break;
          case 'postponementReason':
            updateData.postponement_reason = value;
            break;
          case 'nextPostponementReason':
            updateData.next_postponement_reason = value;
            break;
          case 'isTransferred':
            updateData.is_transferred = value;
            break;
          case 'isResolved':
            updateData.is_resolved = value;
            break;
          default:
            updateData[key] = value;
        }
      }
    });

    const { data, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSession(id: string) {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Clients methods
  async addClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateClient(id: string, updates: Partial<Client>) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteClient(id: string) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}

export const supabaseStore = new SupabaseStore();

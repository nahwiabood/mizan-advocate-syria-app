
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, FileText, Calendar as CalendarIcon, Plus, Printer } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Session, Task, Appointment, Client } from '@/types';
import { formatSyrianDate, isSameDay } from '@/utils/dateUtils';
import { Layout } from '@/components/Layout';
import { ArabicCalendar } from '@/components/ArabicCalendar';
import { SessionsTable } from '@/components/SessionsTable';
import { TasksTable } from '@/components/TasksTable';
import { AppointmentsTable } from '@/components/AppointmentsTable';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { DailySchedulePrint } from '@/components/DailySchedulePrint';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsData, tasksData, appointmentsData, clientsData] = await Promise.all([
        dataStore.getSessions(),
        dataStore.getTasks(),
        dataStore.getAppointments(),
        dataStore.getClients()
      ]);

      setSessions(sessionsData);
      setTasks(tasksData);
      setAppointments(appointmentsData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleToggleTaskComplete = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updates: Partial<Task> = {
          isCompleted: !task.isCompleted,
          completedAt: !task.isCompleted ? new Date() : undefined
        };
        await dataStore.updateTask(taskId, updates);
        await loadData();
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await dataStore.deleteTask(taskId);
      await loadData();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      await dataStore.updateTask(updatedTask.id, updatedTask);
      await loadData();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleAddTask = () => {
    setShowAddTaskDialog(false);
    loadData();
  };

  const handlePrintSchedule = () => {
    setShowPrintDialog(true);
  };

  // فلترة الجلسات للتاريخ المحدد
  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.sessionDate);
    const nextSessionDate = session.nextSessionDate ? new Date(session.nextSessionDate) : null;
    
    return isSameDay(sessionDate, selectedDate) || 
           (nextSessionDate && isSameDay(nextSessionDate, selectedDate));
  });

  // فلترة المواعيد للتاريخ المحدد
  const filteredAppointments = appointments.filter(appointment => 
    isSameDay(new Date(appointment.appointmentDate), selectedDate)
  );

  return (
    <Layout onPrintSchedule={handlePrintSchedule}>
      <div className="container mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 max-w-full" dir="rtl">
        {/* التقويم والمهام */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* التقويم */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-right flex items-center gap-2">
                <CalendarDays className="h-6 w-6 text-blue-600" />
                التقويم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ArabicCalendar 
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                sessions={sessions}
                appointments={appointments}
              />
            </CardContent>
          </Card>

          {/* المهام */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-right flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-orange-600" />
                  المهام
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <TasksTable 
                tasks={tasks} 
                onToggleComplete={handleToggleTaskComplete}
                onDeleteTask={handleDeleteTask}
                onUpdateTask={handleUpdateTask}
                onTaskAdded={loadData}
              />
            </CardContent>
          </Card>
        </div>

        {/* الجلسات - يظهر دائماً */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-right flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-green-600" />
              الجلسات - {formatSyrianDate(selectedDate)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSessions.length > 0 ? (
              <SessionsTable 
                sessions={filteredSessions} 
                onSessionUpdate={loadData}
                selectedDate={selectedDate}
                showAddButton={false}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا يوجد جلسات في هذا التاريخ</p>
                <p className="text-sm mt-2">اختر تاريخاً آخر لعرض الجلسات المتاحة</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* المواعيد - يظهر دائماً */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-right flex items-center gap-2">
              <Clock className="h-6 w-6 text-purple-600" />
              المواعيد - {formatSyrianDate(selectedDate)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AppointmentsTable 
              appointments={filteredAppointments} 
              onAppointmentUpdate={loadData}
              selectedDate={selectedDate}
            />
          </CardContent>
        </Card>
      </div>

      {/* Add Task Dialog */}
      <AddTaskDialog
        isOpen={showAddTaskDialog}
        onClose={() => setShowAddTaskDialog(false)}
        onTaskAdded={handleAddTask}
      />

      {/* Print Dialog */}
      {showPrintDialog && (
        <div className="fixed inset-0 z-50">
          <DailySchedulePrint
            date={selectedDate}
            sessions={filteredSessions}
            appointments={filteredAppointments}
            tasks={tasks}
            onClose={() => setShowPrintDialog(false)}
          />
        </div>
      )}
    </Layout>
  );
};

export default Index;

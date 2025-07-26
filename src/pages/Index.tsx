
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, User, FileText, AlertTriangle, CheckCircle, Users, Gavel, Calendar as CalendarIcon } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Session, Task, Appointment, DayData } from '@/types';
import { formatSyrianDate, formatFullSyrianDate } from '@/utils/dateUtils';
import { ArabicCalendar } from '@/components/ArabicCalendar';
import { SessionsTable } from '@/components/SessionsTable';
import { TasksTable } from '@/components/TasksTable';
import { AppointmentsTable } from '@/components/AppointmentsTable';
import { Layout } from '@/components/Layout';

const Index = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<DayData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsData, tasksData, appointmentsData] = await Promise.all([
        dataStore.getSessions(),
        dataStore.getTasks(),
        dataStore.getAppointments()
      ]);

      setSessions(sessionsData);
      setTasks(tasksData);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Get data for calendar
  const calendarData = useMemo(() => {
    const dataMap = new Map<string, DayData>();

    // Add sessions
    sessions.forEach(session => {
      const dateKey = session.sessionDate.toDateString();
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, {
          date: session.sessionDate,
          sessions: [],
          tasks: [],
          appointments: []
        });
      }
      dataMap.get(dateKey)!.sessions.push(session);
    });

    // Add tasks
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = task.dueDate.toDateString();
        if (!dataMap.has(dateKey)) {
          dataMap.set(dateKey, {
            date: task.dueDate,
            sessions: [],
            tasks: [],
            appointments: []
          });
        }
        dataMap.get(dateKey)!.tasks.push(task);
      }
    });

    // Add appointments
    appointments.forEach(appointment => {
      const dateKey = appointment.appointmentDate.toDateString();
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, {
          date: appointment.appointmentDate,
          sessions: [],
          tasks: [],
          appointments: []
        });
      }
      dataMap.get(dateKey)!.appointments.push(appointment);
    });

    return Array.from(dataMap.values());
  }, [sessions, tasks, appointments]);

  const handleDateClick = (dayData: DayData) => {
    setSelectedDayData(dayData);
    setIsTaskDialogOpen(true);
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      await dataStore.updateTask(taskId, {
        isCompleted: completed,
        completedAt: completed ? new Date() : undefined
      });
      await loadData();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Separate tasks into completed and incomplete
  const completedTasks = tasks.filter(task => task.isCompleted);
  const incompleteTasks = tasks.filter(task => !task.isCompleted);

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6 max-w-full" dir="rtl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                التقويم والأنشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ArabicCalendar 
                sessions={sessions}
                appointments={appointments}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </CardContent>
          </Card>

          {/* Tasks Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <FileText className="h-6 w-6 text-yellow-600" />
                المهام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Incomplete Tasks (Default Tab) */}
              <div>
                <h3 className="font-semibold text-right mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-yellow-600" />
                  المهام غير المنجزة ({incompleteTasks.length})
                </h3>
                <TasksTable 
                  tasks={incompleteTasks}
                  onTaskUpdate={loadData}
                />
              </div>

              {/* Completed Tasks (Secondary Tab) */}
              {completedTasks.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-right mb-4 flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    المهام المنجزة ({completedTasks.length})
                  </h3>
                  <div className="space-y-3">
                    {completedTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="border rounded-lg p-3 bg-green-50">
                        <div className="flex items-center justify-between gap-4">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <div className="flex-1 text-right">
                            <h4 className="font-medium line-through text-gray-600">
                              {task.title}
                            </h4>
                            {task.dueDate && (
                              <p className="text-sm text-gray-500">
                                {formatSyrianDate(task.dueDate)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <Gavel className="h-6 w-6 text-blue-600" />
                آخر الجلسات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SessionsTable 
                sessions={sessions.slice(0, 5)} 
                selectedDate={selectedDate}
                onSessionUpdate={loadData}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-green-600" />
                آخر المواعيد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentsTable 
                appointments={appointments.slice(0, 5)} 
                selectedDate={selectedDate}
                onAppointmentUpdate={loadData}
              />
            </CardContent>
          </Card>
        </div>

        {/* Day Details Dialog */}
        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-right">
                تفاصيل يوم {selectedDayData && formatFullSyrianDate(selectedDayData.date)}
              </DialogTitle>
            </DialogHeader>
            {selectedDayData && (
              <div className="space-y-6" dir="rtl">
                {/* Sessions */}
                {selectedDayData.sessions.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Gavel className="h-5 w-5 text-blue-600" />
                      الجلسات ({selectedDayData.sessions.length})
                    </h3>
                    <SessionsTable 
                      sessions={selectedDayData.sessions} 
                      selectedDate={selectedDayData.date}
                      onSessionUpdate={loadData}
                    />
                  </div>
                )}

                {/* Tasks */}
                {selectedDayData.tasks.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-yellow-600" />
                      المهام ({selectedDayData.tasks.length})
                    </h3>
                    <TasksTable 
                      tasks={selectedDayData.tasks}
                      onTaskUpdate={loadData}
                    />
                  </div>
                )}

                {/* Appointments */}
                {selectedDayData.appointments.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-green-600" />
                      المواعيد ({selectedDayData.appointments.length})
                    </h3>
                    <AppointmentsTable 
                      appointments={selectedDayData.appointments}
                      selectedDate={selectedDayData.date}
                      onAppointmentUpdate={loadData}
                    />
                  </div>
                )}

                {selectedDayData.sessions.length === 0 && 
                 selectedDayData.tasks.length === 0 && 
                 selectedDayData.appointments.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد أنشطة في هذا اليوم</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Index;

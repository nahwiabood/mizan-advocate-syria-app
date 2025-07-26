
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

  // Calculate today's statistics
  const todayStats = useMemo(() => {
    const today = new Date();
    const todayString = today.toDateString();

    const todaySessions = sessions.filter(session => 
      session.sessionDate.toDateString() === todayString
    );

    const todayTasks = tasks.filter(task => 
      task.dueDate && task.dueDate.toDateString() === todayString
    );

    const todayAppointments = appointments.filter(appointment => 
      appointment.appointmentDate.toDateString() === todayString
    );

    const overdueTasks = tasks.filter(task => 
      task.dueDate && task.dueDate < today && !task.isCompleted
    );

    const completedTasks = tasks.filter(task => task.isCompleted);

    return {
      todaySessions: todaySessions.length,
      todayTasks: todayTasks.length,
      todayAppointments: todayAppointments.length,
      overdueTasks: overdueTasks.length,
      totalSessions: sessions.length,
      totalTasks: tasks.length,
      totalAppointments: appointments.length,
      completedTasks: completedTasks.length
    };
  }, [sessions, tasks, appointments]);

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

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6 max-w-full" dir="rtl">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">جلسات اليوم</p>
                  <p className="text-2xl font-bold text-blue-600">{todayStats.todaySessions}</p>
                  <p className="text-xs text-muted-foreground">من أصل {todayStats.totalSessions}</p>
                </div>
                <Gavel className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">مواعيد اليوم</p>
                  <p className="text-2xl font-bold text-green-600">{todayStats.todayAppointments}</p>
                  <p className="text-xs text-muted-foreground">من أصل {todayStats.totalAppointments}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">مهام اليوم</p>
                  <p className="text-2xl font-bold text-yellow-600">{todayStats.todayTasks}</p>
                  <p className="text-xs text-muted-foreground">من أصل {todayStats.totalTasks}</p>
                </div>
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">مهام متأخرة</p>
                  <p className="text-2xl font-bold text-red-600">{todayStats.overdueTasks}</p>
                  <p className="text-xs text-muted-foreground">تحتاج متابعة</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
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

          {/* Quick Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">نظرة سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Today's Sessions */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Gavel className="h-4 w-4 text-blue-600" />
                  جلسات اليوم ({todayStats.todaySessions})
                </h4>
                {sessions
                  .filter(session => session.sessionDate.toDateString() === new Date().toDateString())
                  .slice(0, 3)
                  .map(session => (
                    <div key={session.id} className="p-2 bg-blue-50 rounded text-sm">
                      <p className="font-medium text-right">{session.clientName}</p>
                      <p className="text-muted-foreground text-right">{session.courtName}</p>
                    </div>
                  ))
                }
              </div>

              {/* Today's Appointments */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-green-600" />
                  مواعيد اليوم ({todayStats.todayAppointments})
                </h4>
                {appointments
                  .filter(appointment => appointment.appointmentDate.toDateString() === new Date().toDateString())
                  .slice(0, 3)
                  .map(appointment => (
                    <div key={appointment.id} className="p-2 bg-green-50 rounded text-sm">
                      <p className="font-medium text-right">{appointment.title}</p>
                      <p className="text-muted-foreground text-right">
                        {appointment.time && `${appointment.time} - `}
                        {appointment.location || 'بدون موقع محدد'}
                      </p>
                    </div>
                  ))
                }
              </div>

              {/* Pending Tasks */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-yellow-600" />
                  مهام معلقة
                </h4>
                {tasks
                  .filter(task => !task.isCompleted)
                  .slice(0, 3)
                  .map(task => (
                    <div key={task.id} className="p-2 bg-yellow-50 rounded text-sm">
                      <div className="flex items-center justify-between">
                        <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'}>
                          {task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                        </Badge>
                        <p className="font-medium text-right flex-1 mr-2">{task.title}</p>
                      </div>
                      {task.dueDate && (
                        <p className="text-muted-foreground text-right text-xs mt-1">
                          موعد الانتهاء: {formatSyrianDate(task.dueDate)}
                        </p>
                      )}
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <FileText className="h-6 w-6 text-yellow-600" />
                المهام الحديثة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TasksTable 
                tasks={tasks.slice(0, 5)} 
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
                    <TasksTable tasks={selectedDayData.tasks} />
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

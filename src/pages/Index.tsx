
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Session, Task, Appointment, Client } from '@/types';
import { formatSyrianDate, isSameDay } from '@/utils/dateUtils';
import { Layout } from '@/components/Layout';
import { ArabicCalendar } from '@/components/ArabicCalendar';
import { SessionsTable } from '@/components/SessionsTable';
import { TasksTable } from '@/components/TasksTable';
import { AppointmentsTable } from '@/components/AppointmentsTable';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

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
    <Layout>
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
              <div className="mt-4 text-center">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {formatSyrianDate(selectedDate)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* المهام */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-right flex items-center gap-2">
                <FileText className="h-6 w-6 text-orange-600" />
                المهام
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <TasksTable tasks={tasks} onTaskUpdate={loadData} />
            </CardContent>
          </Card>
        </div>

        {/* الجلسات */}
        {filteredSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-right flex items-center gap-2">
                <CalendarDays className="h-6 w-6 text-green-600" />
                الجلسات - {formatSyrianDate(selectedDate)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SessionsTable 
                sessions={filteredSessions} 
                onSessionUpdate={loadData}
                selectedDate={selectedDate}
              />
            </CardContent>
          </Card>
        )}

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
    </Layout>
  );
};

export default Index;

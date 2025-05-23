
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Printer } from 'lucide-react';
import { ArabicCalendar } from '@/components/ArabicCalendar';
import { SessionsTable } from '@/components/SessionsTable';
import { TasksTable } from '@/components/TasksTable';
import { AppointmentsTable } from '@/components/AppointmentsTable';
import { PastSessionsDialog } from '@/components/PastSessionsDialog';
import { dataStore } from '@/store/dataStore';
import { Session, Task, Appointment } from '@/types';
import { isDateToday, formatFullSyrianDate } from '@/utils/dateUtils';
import { isSameDay } from 'date-fns';
import { Layout } from '@/components/Layout';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDateSessions, setSelectedDateSessions] = useState<Session[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter sessions for selected date
    const filtered = sessions.filter(session => 
      isSameDay(session.sessionDate, selectedDate)
    );
    setSelectedDateSessions(filtered);
  }, [selectedDate, sessions]);

  const loadData = () => {
    setSessions(dataStore.getSessions());
    setTasks(dataStore.getTasks());
    setAppointments(dataStore.getAppointments());
  };

  const handlePrintSchedule = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 min-h-screen space-y-6">
        <Card className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">نظام ميزان لإدارة مكتب المحاماة</h1>
            <Button className="gap-2" onClick={handlePrintSchedule}>
              <Printer className="h-4 w-4" />
              طباعة جدول الأعمال
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Right column - Calendar */}
            <div className="order-1 md:order-1 space-y-4">
              <ArabicCalendar
                sessions={sessions}
                appointments={appointments}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />

              <div className="flex flex-col gap-2">
                <PastSessionsDialog
                  sessions={sessions}
                  onSelectSession={setSelectedDate}
                />
              </div>
            </div>

            {/* Middle and left columns - Content */}
            <div className="md:col-span-2 order-2 md:order-2 space-y-6">
              <SessionsTable
                sessions={selectedDateSessions}
                selectedDate={selectedDate}
                onSessionUpdate={loadData}
              />

              <TasksTable
                tasks={tasks}
                onTaskUpdate={loadData}
              />

              <AppointmentsTable
                appointments={appointments}
                selectedDate={selectedDate}
                onAppointmentUpdate={loadData}
              />
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;

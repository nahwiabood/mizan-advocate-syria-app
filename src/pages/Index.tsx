
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Printer, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { ArabicCalendar } from '@/components/ArabicCalendar';
import { SessionsTable } from '@/components/SessionsTable';
import { TasksTable } from '@/components/TasksTable';
import { AppointmentsTable } from '@/components/AppointmentsTable';
import { PastSessionsDialog } from '@/components/PastSessionsDialog';
import { dataStore } from '@/store/dataStore';
import { Session, Task, Appointment } from '@/types';
import { isDateToday, formatFullSyrianDate } from '@/utils/dateUtils';
import { isSameDay, isAfter, isBefore } from 'date-fns';
import { Layout } from '@/components/Layout';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDateSessions, setSelectedDateSessions] = useState<Session[]>([]);
  const [selectedDateAppointments, setSelectedDateAppointments] = useState<Appointment[]>([]);
  const [unTransferredSessions, setUnTransferredSessions] = useState<Session[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [showUnTransferred, setShowUnTransferred] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const printContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter sessions for selected date
    const filteredSessions = sessions.filter(session => 
      isSameDay(session.sessionDate, selectedDate)
    );
    setSelectedDateSessions(filteredSessions);

    // Filter appointments for selected date
    const filteredAppointments = appointments.filter(appointment => 
      isSameDay(appointment.appointmentDate, selectedDate)
    );
    setSelectedDateAppointments(filteredAppointments);

    // Filter untransferred sessions - sessions before today with no next session date
    const today = new Date();
    const untransferred = sessions.filter(session => 
      isBefore(session.sessionDate, today) && !session.nextSessionDate
    );
    setUnTransferredSessions(untransferred);

    // Filter upcoming sessions (after selected date)
    const upcoming = sessions.filter(session => 
      isAfter(session.sessionDate, selectedDate)
    );
    setUpcomingSessions(upcoming);
  }, [selectedDate, sessions, appointments]);

  const loadData = () => {
    setSessions(dataStore.getSessions());
    setTasks(dataStore.getTasks());
    setAppointments(dataStore.getAppointments());
  };

  const getDisplaySessions = () => {
    if (showUnTransferred) return unTransferredSessions;
    if (showUpcoming) return upcomingSessions;
    return selectedDateSessions;
  };

  const handlePrintSchedule = () => {
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>أجندة - جدول الأعمال ${formatFullSyrianDate(selectedDate)}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                direction: rtl;
                text-align: right;
              }
              h1, h2, h3 { 
                text-align: center; 
                margin-bottom: 20px;
              }
              .page-break { 
                page-break-after: always; 
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                direction: rtl;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: right;
              }
              th {
                background-color: #f2f2f2;
                font-weight: bold;
              }
              .section-title {
                font-size: 18px;
                font-weight: bold;
                margin: 20px 0 10px 0;
                color: #333;
              }
              .no-data {
                text-align: center;
                color: #666;
                font-style: italic;
              }
            </style>
          </head>
          <body>
            <h1>أجندة - جدول الأعمال</h1>
            <h2>${formatFullSyrianDate(selectedDate)}</h2>
            
            <div class="section-title">سجل الجلسات</div>
            ${selectedDateSessions.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>تاريخ الجلسة</th>
                    <th>المحكمة ورقم الأساس</th>
                    <th>الموكل</th>
                    <th>الخصم</th>
                    <th>سبب التأجيل</th>
                    <th>الجلسة القادمة</th>
                    <th>سبب التأجيل القادم</th>
                  </tr>
                </thead>
                <tbody>
                  ${selectedDateSessions.map(session => `
                    <tr>
                      <td>${formatFullSyrianDate(session.sessionDate)}</td>
                      <td>${session.courtName} - ${session.caseNumber}</td>
                      <td>${session.clientName}</td>
                      <td>${session.opponent}</td>
                      <td>${session.postponementReason || '-'}</td>
                      <td>${session.nextSessionDate ? formatFullSyrianDate(session.nextSessionDate) : '-'}</td>
                      <td>${session.nextPostponementReason || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p class="no-data">لا توجد جلسات في هذا التاريخ</p>'}
            
            <div class="section-title">المهام الإدارية</div>
            ${tasks.filter(task => !task.isCompleted).length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>المهمة</th>
                    <th>الوصف</th>
                    <th>تاريخ الاستحقاق</th>
                    <th>درجة الأهمية</th>
                  </tr>
                </thead>
                <tbody>
                  ${tasks.filter(task => !task.isCompleted).map(task => `
                    <tr>
                      <td>${task.title}</td>
                      <td>${task.description || '-'}</td>
                      <td>${task.dueDate ? formatFullSyrianDate(task.dueDate) : '-'}</td>
                      <td>${task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p class="no-data">لا توجد مهام غير مكتملة</p>'}
            
            <div class="section-title">المواعيد</div>
            ${selectedDateAppointments.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>العنوان</th>
                    <th>الوصف</th>
                    <th>تاريخ الموعد</th>
                    <th>الوقت</th>
                    <th>المكان</th>
                  </tr>
                </thead>
                <tbody>
                  ${selectedDateAppointments.map(appointment => `
                    <tr>
                      <td>${appointment.title}</td>
                      <td>${appointment.description || '-'}</td>
                      <td>${formatFullSyrianDate(appointment.appointmentDate)}</td>
                      <td>${appointment.time || '-'}</td>
                      <td>${appointment.location || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p class="no-data">لا توجد مواعيد في هذا التاريخ</p>'}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-2 sm:p-4 min-h-screen space-y-4" dir="rtl">
        <Card className="p-4">
          <div className="flex justify-end items-center mb-6">
            <Button className="gap-2" onClick={handlePrintSchedule}>
              <Printer className="h-4 w-4" />
              طباعة جدول الأعمال
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Right column - Calendar */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
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

              {/* Session Filter Buttons - under calendar for mobile */}
              <div className="lg:hidden flex gap-2 justify-start flex-wrap">
                <Button
                  variant={showUnTransferred ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setShowUnTransferred(true);
                    setShowUpcoming(false);
                  }}
                  className="gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  الجلسات غير المرحلة ({unTransferredSessions.length})
                </Button>
                <Button
                  variant={showUpcoming ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setShowUnTransferred(false);
                    setShowUpcoming(true);
                  }}
                  className="gap-2"
                >
                  <Clock className="h-4 w-4" />
                  الجلسات القادمة ({upcomingSessions.length})
                </Button>
              </div>

              {/* Appointments under Calendar for desktop */}
              <div className="hidden lg:block">
                <AppointmentsTable
                  appointments={selectedDateAppointments}
                  selectedDate={selectedDate}
                  onAppointmentUpdate={loadData}
                />
              </div>
            </div>

            {/* Left column - Sessions */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              {/* Session Filter Buttons - for desktop only */}
              <div className="hidden lg:flex gap-2 justify-start flex-wrap">
                <Button
                  variant={showUnTransferred ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setShowUnTransferred(true);
                    setShowUpcoming(false);
                  }}
                  className="gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  الجلسات غير المرحلة ({unTransferredSessions.length})
                </Button>
                <Button
                  variant={showUpcoming ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setShowUnTransferred(false);
                    setShowUpcoming(true);
                  }}
                  className="gap-2"
                >
                  <Clock className="h-4 w-4" />
                  الجلسات القادمة ({upcomingSessions.length})
                </Button>
              </div>

              {/* Sessions Table */}
              <SessionsTable
                sessions={getDisplaySessions()}
                selectedDate={selectedDate}
                onSessionUpdate={loadData}
                showAddButton={!showUnTransferred && !showUpcoming}
              />

              {/* Tasks under Sessions for desktop */}
              <div className="hidden lg:block">
                <TasksTable
                  tasks={tasks}
                  onTaskUpdate={loadData}
                />
              </div>

              {/* Tasks for mobile - under sessions */}
              <div className="lg:hidden">
                <TasksTable
                  tasks={tasks}
                  onTaskUpdate={loadData}
                />
              </div>

              {/* Appointments for mobile - under tasks */}
              <div className="lg:hidden">
                <AppointmentsTable
                  appointments={selectedDateAppointments}
                  selectedDate={selectedDate}
                  onAppointmentUpdate={loadData}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;

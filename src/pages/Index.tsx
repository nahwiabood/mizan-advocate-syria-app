
import React, { useState, useEffect, useRef } from 'react';
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
  const [selectedDateAppointments, setSelectedDateAppointments] = useState<Appointment[]>([]);
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
  }, [selectedDate, sessions, appointments]);

  const loadData = () => {
    setSessions(dataStore.getSessions());
    setTasks(dataStore.getTasks());
    setAppointments(dataStore.getAppointments());
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
            ${tasks.filter(task => !task.completed).length > 0 ? `
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
                  ${tasks.filter(task => !task.completed).map(task => `
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
      <div className="container mx-auto p-4 min-h-screen space-y-6">
        <Card className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">أجندة - نظام إدارة مكتب المحاماة</h1>
            <Button className="gap-2" onClick={handlePrintSchedule}>
              <Printer className="h-4 w-4" />
              طباعة جدول الأعمال
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Right column - Calendar */}
            <div className="order-1 lg:order-1 space-y-4 calendar-section">
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

              {/* Sessions Table under Calendar */}
              <div className="mt-6">
                <SessionsTable
                  sessions={selectedDateSessions}
                  selectedDate={selectedDate}
                  onSessionUpdate={loadData}
                  showAddButton={false}
                />
              </div>
            </div>

            {/* Left column - Tasks and Appointments */}
            <div className="order-2 lg:order-2 space-y-6">
              <TasksTable
                tasks={tasks}
                onTaskUpdate={loadData}
              />

              <AppointmentsTable
                appointments={selectedDateAppointments}
                selectedDate={selectedDate}
                onAppointmentUpdate={loadData}
              />
            </div>

            {/* Middle column - Additional content can go here */}
            <div className="order-3 lg:order-3">
              {/* This column can be used for additional content in the future */}
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckSquare, Users, FileText, CalendarDays, TrendingUp } from 'lucide-react';
import { formatSyrianDate } from '@/utils/dateUtils';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const Index = () => {
  const { 
    sessions, 
    tasks, 
    clients, 
    cases, 
    appointments, 
    loading 
  } = useSupabaseData();

  const today = new Date();
  const todaySessions = sessions.filter(session => 
    session.sessionDate.toDateString() === today.toDateString()
  );
  
  const todayAppointments = appointments.filter(appointment => 
    appointment.appointmentDate.toDateString() === today.toDateString()
  );
  
  const pendingTasks = tasks.filter(task => !task.isCompleted);
  const activeCases = cases.filter(case_ => case_.status === 'active');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            نظام إدارة مكتب المحاماة
          </h1>
          <p className="text-gray-600 text-lg">
            مرحباً بك في نظام إدارة شؤون المكتب - {formatSyrianDate(today)}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" dir="rtl">
              <CardTitle className="text-sm font-medium text-gray-600">إجمالي العملاء</CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{clients.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" dir="rtl">
              <CardTitle className="text-sm font-medium text-gray-600">القضايا النشطة</CardTitle>
              <FileText className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{activeCases.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" dir="rtl">
              <CardTitle className="text-sm font-medium text-gray-600">جلسات اليوم</CardTitle>
              <Calendar className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{todaySessions.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" dir="rtl">
              <CardTitle className="text-sm font-medium text-gray-600">المهام المعلقة</CardTitle>
              <CheckSquare className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{pendingTasks.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Sessions */}
          <Card className="bg-white shadow-lg">
            <CardHeader dir="rtl">
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Calendar className="h-5 w-5" />
                جلسات اليوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaySessions.length > 0 ? (
                <div className="space-y-3">
                  {todaySessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="border-r-4 border-orange-500 pr-4 py-2">
                      <div className="font-semibold text-gray-900">{session.clientName}</div>
                      <div className="text-sm text-gray-600">{session.courtName}</div>
                      <div className="text-xs text-gray-500">رقم القضية: {session.caseNumber}</div>
                    </div>
                  ))}
                  {todaySessions.length > 5 && (
                    <div className="text-sm text-gray-500 text-center">
                      و {todaySessions.length - 5} جلسات أخرى...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  لا توجد جلسات اليوم
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card className="bg-white shadow-lg">
            <CardHeader dir="rtl">
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <CalendarDays className="h-5 w-5" />
                مواعيد اليوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="border-r-4 border-blue-500 pr-4 py-2">
                      <div className="font-semibold text-gray-900">{appointment.title}</div>
                      {appointment.time && (
                        <div className="text-sm text-gray-600">الوقت: {appointment.time}</div>
                      )}
                      {appointment.location && (
                        <div className="text-xs text-gray-500">المكان: {appointment.location}</div>
                      )}
                    </div>
                  ))}
                  {todayAppointments.length > 5 && (
                    <div className="text-sm text-gray-500 text-center">
                      و {todayAppointments.length - 5} مواعيد أخرى...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  لا توجد مواعيد اليوم
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <Card className="bg-white shadow-lg mt-6">
            <CardHeader dir="rtl">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <CheckSquare className="h-5 w-5" />
                المهام المعلقة المهمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTasks
                  .filter(task => task.priority === 'high')
                  .slice(0, 3)
                  .map((task) => (
                    <div key={task.id} className="border-r-4 border-red-500 pr-4 py-2">
                      <div className="font-semibold text-gray-900">{task.title}</div>
                      {task.dueDate && (
                        <div className="text-sm text-gray-600">
                          موعد الاستحقاق: {formatSyrianDate(task.dueDate)}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Navigation */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/clients"
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg text-center transition-colors"
          >
            <Users className="h-8 w-8 mx-auto mb-2" />
            <div className="font-semibold">العملاء</div>
          </a>
          <a
            href="/sessions"
            className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg text-center transition-colors"
          >
            <Calendar className="h-8 w-8 mx-auto mb-2" />
            <div className="font-semibold">الجلسات</div>
          </a>
          <a
            href="/tasks"
            className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-lg text-center transition-colors"
          >
            <CheckSquare className="h-8 w-8 mx-auto mb-2" />
            <div className="font-semibold">المهام</div>
          </a>
          <a
            href="/office-accounting"
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg text-center transition-colors"
          >
            <TrendingUp className="h-8 w-8 mx-auto mb-2" />
            <div className="font-semibold">المحاسبة</div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;

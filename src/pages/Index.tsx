
import { useState } from "react";
import { Calendar, Clock, CheckSquare, Users, FileText, Plus } from "lucide-react";
import Layout from "@/components/Layout";
import { ArabicCalendar } from "@/components/ArabicCalendar";
import { SessionsTable } from "@/components/SessionsTable";
import { TasksTable } from "@/components/TasksTable";
import { AppointmentsTable } from "@/components/AppointmentsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { formatSyrianDate } from "@/utils/dateUtils";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { 
    tasks, 
    appointments, 
    sessions, 
    clients, 
    cases, 
    stages,
    isLoading,
    refetch 
  } = useSupabaseData();

  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.sessionDate);
    return sessionDate.toDateString() === selectedDate.toDateString();
  });

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.appointmentDate);
    return appointmentDate.toDateString() === selectedDate.toDateString();
  });

  const incompleteTasks = tasks.filter(task => !task.isCompleted);
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === new Date().toDateString();
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>جاري تحميل البيانات...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-2 text-right">نظام إدارة المكتب القانوني</h1>
          <p className="text-blue-100 text-right">مرحباً بك في نظام إدارة شؤون المحاماة</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">العملاء</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{clients.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">القضايا النشطة</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">
                {cases.filter(c => c.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">المهام المعلقة</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{incompleteTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">مهام اليوم</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{todayTasks.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <ArabicCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              sessions={sessions}
              appointments={appointments}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="sessions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sessions" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  الجلسات
                </TabsTrigger>
                <TabsTrigger value="appointments" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  المواعيد
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  المهام
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sessions" className="space-y-4">
                <SessionsTable
                  sessions={filteredSessions}
                  selectedDate={selectedDate}
                  onSessionUpdate={refetch}
                />
              </TabsContent>

              <TabsContent value="appointments" className="space-y-4">
                <AppointmentsTable
                  appointments={filteredAppointments}
                  selectedDate={selectedDate}
                  onAppointmentUpdate={refetch}
                />
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-right">المهام</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TasksTable tasks={tasks} onTaskUpdate={refetch} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;

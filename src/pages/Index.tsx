
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Scale, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  Eye,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { dataStore } from '@/store/dataStore';
import { Session, Appointment, Client, Case, CaseStage } from '@/types';
import { formatSyrianDate, formatSyrianDateTime, isDateToday, isDatePast } from '@/utils/dateUtils';
import { Layout } from '@/components/Layout';
import { SessionsTable } from '@/components/SessionsTable';
import { AppointmentsTable } from '@/components/AppointmentsTable';
import { TasksTable } from '@/components/TasksTable';
import { ArabicCalendar } from '@/components/ArabicCalendar';
import { AppointmentTimePicker } from '@/components/AppointmentTimePicker';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [stages, setStages] = useState<CaseStage[]>([]);
  const [isAddSessionDialogOpen, setIsAddSessionDialogOpen] = useState(false);
  const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>('');

  const [newSession, setNewSession] = useState({
    sessionDate: new Date(),
    sessionTime: '',
    notes: '',
    status: 'scheduled' as const,
  });

  const [newAppointment, setNewAppointment] = useState({
    appointmentDate: new Date(),
    appointmentTime: '',
    clientName: '',
    description: '',
    location: '',
    status: 'scheduled' as const,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSessions(dataStore.getSessions());
    setAppointments(dataStore.getAppointments());
    setClients(dataStore.getClients());
    setCases(dataStore.getCases());
    setStages(dataStore.getStages());
  };

  const handleAddSession = () => {
    if (!selectedStage || !newSession.sessionDate) return;

    dataStore.addSession({
      stageId: selectedStage,
      sessionDate: newSession.sessionDate,
      sessionTime: newSession.sessionTime,
      notes: newSession.notes,
      status: newSession.status,
    });

    setNewSession({
      sessionDate: new Date(),
      sessionTime: '',
      notes: '',
      status: 'scheduled',
    });
    setSelectedStage('');
    setIsAddSessionDialogOpen(false);
    loadData();
  };

  const handleAddAppointment = () => {
    if (!newAppointment.appointmentDate || !newAppointment.clientName) return;

    dataStore.addAppointment({
      appointmentDate: newAppointment.appointmentDate,
      appointmentTime: newAppointment.appointmentTime,
      clientName: newAppointment.clientName,
      description: newAppointment.description,
      location: newAppointment.location,
      status: newAppointment.status,
    });

    setNewAppointment({
      appointmentDate: new Date(),
      appointmentTime: '',
      clientName: '',
      description: '',
      location: '',
      status: 'scheduled',
    });
    setIsAddAppointmentDialogOpen(false);
    loadData();
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const todaySessions = sessions.filter(session => isDateToday(session.sessionDate));
  const upcomingSessions = sessions.filter(session => !isDatePast(session.sessionDate) && !isDateToday(session.sessionDate)).slice(0, 5);
  const todayAppointments = appointments.filter(appointment => isDateToday(appointment.appointmentDate));
  const upcomingAppointments = appointments.filter(appointment => !isDatePast(appointment.appointmentDate) && !isDateToday(appointment.appointmentDate)).slice(0, 5);

  const activeStages = stages.filter(stage => stage.status === 'active');

  const onWeekendWarning = (date: Date) => {
    console.log('Weekend warning for date:', date);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6" dir="rtl">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الموكلين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{clients.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">القضايا النشطة</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{cases.filter(c => c.status === 'active').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">جلسات اليوم</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{todaySessions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مواعيد اليوم</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{todayAppointments.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <ArabicCalendar
              sessions={sessions}
              appointments={appointments}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
          </div>

          {/* Today's Activities */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Sessions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-right">جلسات اليوم</CardTitle>
                  <Dialog open={isAddSessionDialogOpen} onOpenChange={setIsAddSessionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        إضافة جلسة
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md" dir="rtl">
                      <DialogHeader>
                        <DialogTitle className="text-right">إضافة جلسة جديدة</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="text-right">
                          <Label htmlFor="stage" className="text-right">المرحلة *</Label>
                          <Select value={selectedStage} onValueChange={setSelectedStage}>
                            <SelectTrigger className="text-right" dir="rtl">
                              <SelectValue placeholder="اختر المرحلة" />
                            </SelectTrigger>
                            <SelectContent>
                              {activeStages.map((stage) => {
                                const case_ = cases.find(c => c.id === stage.caseId);
                                const client = clients.find(c => c.id === case_?.clientId);
                                return (
                                  <SelectItem key={stage.id} value={stage.id}>
                                    {client?.name} - {case_?.description} - {stage.stageName}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="text-right">
                          <Label className="text-right">تاريخ الجلسة *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-right font-normal",
                                  !newSession.sessionDate && "text-muted-foreground"
                                )}
                                dir="rtl"
                              >
                                <CalendarIcon className="ml-2 h-4 w-4" />
                                {newSession.sessionDate ? (
                                  formatSyrianDate(newSession.sessionDate)
                                ) : (
                                  <span>اختر التاريخ</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={newSession.sessionDate}
                                onSelect={(date) => setNewSession({ ...newSession, sessionDate: date || new Date() })}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="text-right">
                          <Label htmlFor="sessionTime" className="text-right">وقت الجلسة</Label>
                          <Input
                            id="sessionTime"
                            type="time"
                            value={newSession.sessionTime}
                            onChange={(e) => setNewSession({ ...newSession, sessionTime: e.target.value })}
                            className="text-right"
                            dir="rtl"
                          />
                        </div>
                        <div className="text-right">
                          <Label htmlFor="sessionStatus" className="text-right">الحالة</Label>
                          <Select value={newSession.status} onValueChange={(value: 'scheduled' | 'completed' | 'postponed') => setNewSession({ ...newSession, status: value })}>
                            <SelectTrigger className="text-right" dir="rtl">
                              <SelectValue placeholder="اختر الحالة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">مجدولة</SelectItem>
                              <SelectItem value="completed">مكتملة</SelectItem>
                              <SelectItem value="postponed">مؤجلة</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="text-right">
                          <Label htmlFor="sessionNotes" className="text-right">ملاحظات</Label>
                          <Textarea
                            id="sessionNotes"
                            value={newSession.notes}
                            onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                            placeholder="ملاحظات الجلسة"
                            className="text-right"
                            dir="rtl"
                          />
                        </div>
                        <Button onClick={handleAddSession} className="w-full">
                          إضافة الجلسة
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {todaySessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">لا توجد جلسات اليوم</p>
                ) : (
                  <SessionsTable 
                    sessions={todaySessions} 
                    onSessionUpdate={loadData}
                    showAddButton={false}
                    onWeekendWarning={onWeekendWarning}
                  />
                )}
              </CardContent>
            </Card>

            {/* Today's Appointments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-right">مواعيد اليوم</CardTitle>
                  <Dialog open={isAddAppointmentDialogOpen} onOpenChange={setIsAddAppointmentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        إضافة موعد
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md" dir="rtl">
                      <DialogHeader>
                        <DialogTitle className="text-right">إضافة موعد جديد</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="text-right">
                          <Label htmlFor="clientName" className="text-right">اسم الموكل *</Label>
                          <Input
                            id="clientName"
                            value={newAppointment.clientName}
                            onChange={(e) => setNewAppointment({ ...newAppointment, clientName: e.target.value })}
                            placeholder="اسم الموكل"
                            className="text-right"
                            dir="rtl"
                          />
                        </div>
                        <div className="text-right">
                          <Label className="text-right">تاريخ الموعد *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-right font-normal",
                                  !newAppointment.appointmentDate && "text-muted-foreground"
                                )}
                                dir="rtl"
                              >
                                <CalendarIcon className="ml-2 h-4 w-4" />
                                {newAppointment.appointmentDate ? (
                                  formatSyrianDate(newAppointment.appointmentDate)
                                ) : (
                                  <span>اختر التاريخ</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={newAppointment.appointmentDate}
                                onSelect={(date) => setNewAppointment({ ...newAppointment, appointmentDate: date || new Date() })}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <AppointmentTimePicker
                          value={newAppointment.appointmentTime}
                          onChange={(time) => setNewAppointment({ ...newAppointment, appointmentTime: time })}
                        />
                        <div className="text-right">
                          <Label htmlFor="description" className="text-right">الوصف</Label>
                          <Textarea
                            id="description"
                            value={newAppointment.description}
                            onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
                            placeholder="وصف الموعد"
                            className="text-right"
                            dir="rtl"
                          />
                        </div>
                        <div className="text-right">
                          <Label htmlFor="location" className="text-right">المكان</Label>
                          <Input
                            id="location"
                            value={newAppointment.location}
                            onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })}
                            placeholder="مكان الموعد"
                            className="text-right"
                            dir="rtl"
                          />
                        </div>
                        <div className="text-right">
                          <Label htmlFor="appointmentStatus" className="text-right">الحالة</Label>
                          <Select value={newAppointment.status} onValueChange={(value: 'scheduled' | 'completed' | 'cancelled') => setNewAppointment({ ...newAppointment, status: value })}>
                            <SelectTrigger className="text-right" dir="rtl">
                              <SelectValue placeholder="اختر الحالة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">مجدول</SelectItem>
                              <SelectItem value="completed">مكتمل</SelectItem>
                              <SelectItem value="cancelled">ملغي</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddAppointment} className="w-full">
                          إضافة الموعد
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {todayAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">لا توجد مواعيد اليوم</p>
                ) : (
                  <AppointmentsTable appointments={todayAppointments} onAppointmentUpdate={loadData} showAddButton={false} />
                )}
              </CardContent>
            </Card>

            {/* Upcoming Sessions Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right">الجلسات القادمة</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">لا توجد جلسات قادمة</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingSessions.map((session) => {
                      const stage = stages.find(s => s.id === session.stageId);
                      const case_ = cases.find(c => c.id === stage?.caseId);
                      const client = clients.find(c => c.id === case_?.clientId);
                      
                      return (
                        <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="text-right">
                            <p className="font-medium">{client?.name} - {case_?.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatSyrianDate(session.sessionDate)} {session.sessionTime && `- ${session.sessionTime}`}
                            </p>
                          </div>
                          <Badge variant={session.status === 'scheduled' ? 'default' : session.status === 'completed' ? 'outline' : 'destructive'}>
                            {session.status === 'scheduled' ? 'مجدولة' : session.status === 'completed' ? 'مكتملة' : 'مؤجلة'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tasks Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-right">المهام</CardTitle>
          </CardHeader>
          <CardContent>
            <TasksTable />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Appointment } from '@/types';
import { dataStore } from '@/store/dataStore';
import { formatSyrianDate, formatFullSyrianDate } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import { isSameDay } from 'date-fns';

interface AppointmentsTableProps {
  appointments: Appointment[];
  selectedDate: Date;
  onAppointmentUpdate: () => void;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  selectedDate,
  onAppointmentUpdate,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    appointmentDate: undefined as Date | undefined,
    time: '09:00',
    duration: 60,
    clientName: '',
    location: '',
  });

  const dayAppointments = appointments.filter(appointment => 
    isSameDay(appointment.appointmentDate, selectedDate)
  );

  const handleAddAppointment = () => {
    if (!newAppointment.title || !newAppointment.appointmentDate) {
      return;
    }

    // Combine date and time
    const [hours, minutes] = newAppointment.time.split(':').map(Number);
    const appointmentDateTime = new Date(newAppointment.appointmentDate);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    dataStore.addAppointment({
      title: newAppointment.title,
      description: newAppointment.description,
      appointmentDate: appointmentDateTime,
      duration: newAppointment.duration,
      clientName: newAppointment.clientName,
      location: newAppointment.location,
    });

    setNewAppointment({
      title: '',
      description: '',
      appointmentDate: undefined,
      time: '09:00',
      duration: 60,
      clientName: '',
      location: '',
    });
    setIsAddDialogOpen(false);
    onAppointmentUpdate();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SY', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const sortedAppointments = dayAppointments.sort((a, b) => 
    a.appointmentDate.getTime() - b.appointmentDate.getTime()
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>مواعيد {formatFullSyrianDate(selectedDate)}</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة موعد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة موعد جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="appointmentTitle">عنوان الموعد</Label>
                  <Input
                    id="appointmentTitle"
                    value={newAppointment.title}
                    onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                    placeholder="أدخل عنوان الموعد"
                  />
                </div>
                <div>
                  <Label htmlFor="appointmentDescription">الوصف</Label>
                  <Textarea
                    id="appointmentDescription"
                    value={newAppointment.description}
                    onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
                    placeholder="أدخل وصف الموعد (اختياري)"
                  />
                </div>
                <div>
                  <Label>التاريخ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-right font-normal",
                          !newAppointment.appointmentDate && "text-muted-foreground"
                        )}
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
                        onSelect={(date) => setNewAppointment({ ...newAppointment, appointmentDate: date })}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appointmentTime">الوقت</Label>
                    <Select
                      value={newAppointment.time}
                      onValueChange={(value) => setNewAppointment({ ...newAppointment, time: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="appointmentDuration">المدة (دقيقة)</Label>
                    <Select
                      value={newAppointment.duration.toString()}
                      onValueChange={(value) => setNewAppointment({ ...newAppointment, duration: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 دقيقة</SelectItem>
                        <SelectItem value="60">60 دقيقة</SelectItem>
                        <SelectItem value="90">90 دقيقة</SelectItem>
                        <SelectItem value="120">120 دقيقة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="clientName">اسم العميل</Label>
                  <Input
                    id="clientName"
                    value={newAppointment.clientName}
                    onChange={(e) => setNewAppointment({ ...newAppointment, clientName: e.target.value })}
                    placeholder="اسم العميل (اختياري)"
                  />
                </div>
                <div>
                  <Label htmlFor="location">المكان</Label>
                  <Input
                    id="location"
                    value={newAppointment.location}
                    onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })}
                    placeholder="مكان الموعد (اختياري)"
                  />
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
        {sortedAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد مواعيد في هذا التاريخ
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAppointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{appointment.title}</h4>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 ml-2" />
                    <span>{formatTime(appointment.appointmentDate)}</span>
                  </div>
                </div>
                
                {appointment.description && (
                  <p className="text-sm">{appointment.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {appointment.clientName && (
                    <div>
                      <span className="text-sm text-muted-foreground">العميل:</span>
                      <p className="font-medium">{appointment.clientName}</p>
                    </div>
                  )}
                  
                  {appointment.location && (
                    <div>
                      <span className="text-sm text-muted-foreground">المكان:</span>
                      <p className="font-medium">{appointment.location}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-sm text-muted-foreground">المدة:</span>
                    <p className="font-medium">{appointment.duration} دقيقة</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar as CalendarIcon, Clock, Edit, Trash2 } from 'lucide-react';
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    appointmentDate: undefined as Date | undefined,
    time: '09:00',
    duration: 60,
    clientName: '',
    location: '',
  });
  const [rescheduleData, setRescheduleData] = useState({
    appointmentDate: undefined as Date | undefined,
    time: '09:00',
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
  
  const handleEditAppointment = () => {
    if (!selectedAppointment || !newAppointment.title) {
      return;
    }
    
    // Combine date and time
    const [hours, minutes] = newAppointment.time.split(':').map(Number);
    const appointmentDate = newAppointment.appointmentDate || selectedAppointment.appointmentDate;
    const appointmentDateTime = new Date(appointmentDate);
    appointmentDateTime.setHours(hours, minutes, 0, 0);
    
    dataStore.updateAppointment(selectedAppointment.id, {
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
    setIsEditDialogOpen(false);
    setSelectedAppointment(null);
    onAppointmentUpdate();
  };
  
  const handleRescheduleAppointment = () => {
    if (!selectedAppointment || !rescheduleData.appointmentDate) {
      return;
    }
    
    // Combine date and time
    const [hours, minutes] = rescheduleData.time.split(':').map(Number);
    const appointmentDateTime = new Date(rescheduleData.appointmentDate);
    appointmentDateTime.setHours(hours, minutes, 0, 0);
    
    dataStore.updateAppointment(selectedAppointment.id, {
      appointmentDate: appointmentDateTime,
    });
    
    setRescheduleData({
      appointmentDate: undefined,
      time: '09:00',
    });
    setIsRescheduleDialogOpen(false);
    setSelectedAppointment(null);
    onAppointmentUpdate();
  };
  
  const handleDeleteAppointment = () => {
    if (!selectedAppointment) return;
    
    dataStore.deleteAppointment(selectedAppointment.id);
    setIsDeleteDialogOpen(false);
    setSelectedAppointment(null);
    onAppointmentUpdate();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SY', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };
  
  const openEditDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    
    // Extract time
    const hours = appointment.appointmentDate.getHours().toString().padStart(2, '0');
    const minutes = appointment.appointmentDate.getMinutes().toString().padStart(2, '0');
    
    setNewAppointment({
      title: appointment.title,
      description: appointment.description || '',
      appointmentDate: appointment.appointmentDate,
      time: `${hours}:${minutes}`,
      duration: appointment.duration,
      clientName: appointment.clientName || '',
      location: appointment.location || '',
    });
    setIsEditDialogOpen(true);
  };
  
  const openRescheduleDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    
    // Extract time
    const hours = appointment.appointmentDate.getHours().toString().padStart(2, '0');
    const minutes = appointment.appointmentDate.getMinutes().toString().padStart(2, '0');
    
    setRescheduleData({
      appointmentDate: appointment.appointmentDate,
      time: `${hours}:${minutes}`,
    });
    setIsRescheduleDialogOpen(true);
  };
  
  const openDeleteDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteDialogOpen(true);
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
                
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openRescheduleDialog(appointment)}
                    className="flex-1"
                  >
                    <CalendarIcon className="h-4 w-4 ml-1" />
                    إعادة جدولة
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(appointment)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(appointment)}
                    className="text-red-500 hover:text-red-700 flex-1"
                  >
                    <Trash2 className="h-4 w-4 ml-1" />
                    حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Edit Appointment Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تعديل الموعد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-appointmentTitle">عنوان الموعد</Label>
                <Input
                  id="edit-appointmentTitle"
                  value={newAppointment.title}
                  onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                  placeholder="أدخل عنوان الموعد"
                />
              </div>
              <div>
                <Label htmlFor="edit-appointmentDescription">الوصف</Label>
                <Textarea
                  id="edit-appointmentDescription"
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
                  <Label htmlFor="edit-appointmentTime">الوقت</Label>
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
                  <Label htmlFor="edit-appointmentDuration">المدة (دقيقة)</Label>
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
                <Label htmlFor="edit-clientName">اسم العميل</Label>
                <Input
                  id="edit-clientName"
                  value={newAppointment.clientName}
                  onChange={(e) => setNewAppointment({ ...newAppointment, clientName: e.target.value })}
                  placeholder="اسم العميل (اختياري)"
                />
              </div>
              <div>
                <Label htmlFor="edit-location">المكان</Label>
                <Input
                  id="edit-location"
                  value={newAppointment.location}
                  onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })}
                  placeholder="مكان الموعد (اختياري)"
                />
              </div>
              <Button onClick={handleEditAppointment} className="w-full">
                حفظ التعديلات
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Reschedule Appointment Dialog */}
        <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إعادة جدولة الموعد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>التاريخ الجديد</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right font-normal",
                        !rescheduleData.appointmentDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {rescheduleData.appointmentDate ? (
                        formatSyrianDate(rescheduleData.appointmentDate)
                      ) : (
                        <span>اختر التاريخ</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={rescheduleData.appointmentDate}
                      onSelect={(date) => setRescheduleData({ ...rescheduleData, appointmentDate: date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="reschedule-time">الوقت الجديد</Label>
                <Select
                  value={rescheduleData.time}
                  onValueChange={(value) => setRescheduleData({ ...rescheduleData, time: value })}
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
              <Button onClick={handleRescheduleAppointment} className="w-full">
                إعادة جدولة الموعد
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Delete Appointment Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>حذف الموعد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>هل أنت متأكد من رغبتك بحذف هذا الموعد؟</p>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAppointment}
                  className="flex-1"
                >
                  حذف
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

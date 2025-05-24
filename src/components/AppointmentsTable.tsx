import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Edit, Trash2, Clock, MapPin } from 'lucide-react';
import { formatSyrianDate, formatFullSyrianDate } from '@/utils/dateUtils';
import { Appointment } from '@/types';
import { dataStore } from '@/store/dataStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AppointmentsTableProps {
  appointments: Appointment[];
  selectedDate: Date;
  onAppointmentUpdate: () => void;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  selectedDate,
  onAppointmentUpdate
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    appointmentDate: selectedDate,
    time: '',
    location: '',
  });

  const handleAddAppointment = () => {
    if (!newAppointment.title || !newAppointment.appointmentDate) {
      return;
    }

    dataStore.addAppointment({
      title: newAppointment.title,
      description: newAppointment.description,
      appointmentDate: newAppointment.appointmentDate,
      time: newAppointment.time,
      location: newAppointment.location,
    });

    setNewAppointment({
      title: '',
      description: '',
      appointmentDate: selectedDate,
      time: '',
      location: '',
    });
    setIsAddDialogOpen(false);
    onAppointmentUpdate();
  };

  const handleEditAppointment = () => {
    if (!selectedAppointment) return;
    
    dataStore.updateAppointment(selectedAppointment.id, {
      title: newAppointment.title || selectedAppointment.title,
      description: newAppointment.description || selectedAppointment.description,
      appointmentDate: newAppointment.appointmentDate || selectedAppointment.appointmentDate,
      time: newAppointment.time || selectedAppointment.time,
      location: newAppointment.location || selectedAppointment.location,
    });
    
    setIsEditDialogOpen(false);
    setSelectedAppointment(null);
    setNewAppointment({
      title: '',
      description: '',
      appointmentDate: selectedDate,
      time: '',
      location: '',
    });
    onAppointmentUpdate();
  };

  const handleDeleteAppointment = () => {
    if (!selectedAppointment) return;
    
    dataStore.deleteAppointment(selectedAppointment.id);
    setIsDeleteDialogOpen(false);
    setSelectedAppointment(null);
    onAppointmentUpdate();
  };

  const openEditDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNewAppointment({
      title: appointment.title,
      description: appointment.description || '',
      appointmentDate: appointment.appointmentDate,
      time: appointment.time || '',
      location: appointment.location || '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-right">مواعيد {formatFullSyrianDate(selectedDate)}</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
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
                  <Label htmlFor="title" className="text-right">عنوان الموعد *</Label>
                  <Input
                    id="title"
                    value={newAppointment.title}
                    onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                    placeholder="عنوان الموعد"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="text-right">
                  <Label htmlFor="description" className="text-right">الوصف (اختياري)</Label>
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
                        onSelect={(date) => date && setNewAppointment({ ...newAppointment, appointmentDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="text-right">
                  <Label htmlFor="time" className="text-right">الوقت (اختياري)</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="text-right">
                  <Label htmlFor="location" className="text-right">المكان (اختياري)</Label>
                  <Input
                    id="location"
                    value={newAppointment.location}
                    onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })}
                    placeholder="مكان الموعد"
                    className="text-right"
                    dir="rtl"
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
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد مواعيد في هذا التاريخ
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(appointment)}
                    className="gap-1 shrink-0"
                  >
                    <Edit className="h-4 w-4" />
                    تعديل
                  </Button>
                  
                  <div className="flex-1 text-right space-y-3">
                    <h4 className="font-semibold text-lg">{appointment.title}</h4>
                    
                    {appointment.description && (
                      <p className="text-gray-600 text-sm leading-relaxed">{appointment.description}</p>
                    )}
                    
                    <div className="flex flex-col gap-2 text-sm text-gray-500">
                      <div className="flex items-center justify-end gap-2">
                        <span>{formatSyrianDate(appointment.appointmentDate)}</span>
                        <CalendarIcon className="h-4 w-4" />
                      </div>
                      
                      {appointment.time && (
                        <div className="flex items-center justify-end gap-2">
                          <span>{appointment.time}</span>
                          <Clock className="h-4 w-4" />
                        </div>
                      )}
                      
                      {appointment.location && (
                        <div className="flex items-center justify-end gap-2">
                          <span>{appointment.location}</span>
                          <MapPin className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Appointment Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">تعديل الموعد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-right">
                <Label htmlFor="edit-title" className="text-right">عنوان الموعد</Label>
                <Input
                  id="edit-title"
                  value={newAppointment.title}
                  onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                  placeholder="عنوان الموعد"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="edit-description" className="text-right">الوصف (اختياري)</Label>
                <Textarea
                  id="edit-description"
                  value={newAppointment.description}
                  onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
                  placeholder="وصف الموعد"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label className="text-right">تاريخ الموعد</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-right font-normal"
                      dir="rtl"
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {formatSyrianDate(newAppointment.appointmentDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newAppointment.appointmentDate}
                      onSelect={(date) => date && setNewAppointment({ ...newAppointment, appointmentDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="text-right">
                <Label htmlFor="edit-time" className="text-right">الوقت (اختياري)</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="edit-location" className="text-right">المكان (اختياري)</Label>
                <Input
                  id="edit-location"
                  value={newAppointment.location}
                  onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })}
                  placeholder="مكان الموعد"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEditAppointment} className="flex-1">
                  حفظ التعديلات
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="flex-1 gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-right">
              <p>هل أنت متأكد من رغبتك في حذف هذا الموعد؟</p>
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

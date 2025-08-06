
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { dataStore } from '@/store/dataStore';
import { Appointment } from '@/types';
import { formatSyrianDate } from '@/utils/dateUtils';

interface EditAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onAppointmentUpdated: () => void;
}

export const EditAppointmentDialog: React.FC<EditAppointmentDialogProps> = ({
  isOpen,
  onClose,
  appointment,
  onAppointmentUpdated
}) => {
  const [formData, setFormData] = useState({
    title: '',
    appointmentDate: new Date(),
    time: '',
    location: '',
    description: '',
    duration: 60
  });

  useEffect(() => {
    if (appointment) {
      setFormData({
        title: appointment.title,
        appointmentDate: new Date(appointment.appointmentDate),
        time: appointment.time || '',
        location: appointment.location || '',
        description: appointment.description || '',
        duration: appointment.duration || 60
      });
    }
  }, [appointment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedAppointment = {
        ...formData,
        appointmentDate: formData.appointmentDate.toISOString()
      };

      await dataStore.updateAppointment(appointment.id, updatedAppointment);
      onAppointmentUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل الموعد</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
          <div>
            <Label htmlFor="title" className="text-right">العنوان *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="text-right"
              required
            />
          </div>

          <div>
            <Label className="text-right">التاريخ *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-end text-right font-normal",
                    !formData.appointmentDate && "text-muted-foreground"
                  )}
                >
                  {formData.appointmentDate ? (
                    formatSyrianDate(formData.appointmentDate)
                  ) : (
                    <span>اختر التاريخ</span>
                  )}
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.appointmentDate}
                  onSelect={(date) => date && handleInputChange('appointmentDate', date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="time" className="text-right">الوقت</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              className="text-right"
            />
          </div>

          <div>
            <Label htmlFor="location" className="text-right">المكان</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="text-right"
              placeholder="مكان الموعد"
            />
          </div>

          <div>
            <Label htmlFor="duration" className="text-right">المدة (بالدقائق)</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="480"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 60)}
              className="text-right"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-right">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="text-right resize-none"
              rows={3}
              placeholder="وصف الموعد (اختياري)"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              إلغاء
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              حفظ التغييرات
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

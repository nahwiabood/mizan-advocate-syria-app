
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFullSyrianDate } from '@/utils/dateUtils';
import { AppointmentTimePicker } from './AppointmentTimePicker';

interface AddAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: any) => Promise<void>;
  selectedDate?: Date;
}

export const AddAppointmentDialog: React.FC<AddAppointmentDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    appointmentDate: selectedDate || new Date(),
    time: '',
    location: ''
  });

  const handleSave = async () => {
    await onSave({
      title: formData.title,
      description: formData.description,
      appointmentDate: formData.appointmentDate,
      time: formData.time,
      location: formData.location,
      duration: 60 // افتراضي 60 دقيقة
    });
    
    // إعادة تعيين النموذج
    setFormData({
      title: '',
      description: '',
      appointmentDate: selectedDate || new Date(),
      time: '',
      location: ''
    });
    
    onClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      appointmentDate: selectedDate || new Date(),
      time: '',
      location: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة موعد جديد</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">العنوان *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="عنوان الموعد"
              className="text-right"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="تفاصيل الموعد"
              className="text-right resize-none"
              rows={3}
            />
          </div>

          <div>
            <Label>التاريخ *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-end text-right font-normal",
                    !formData.appointmentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {formData.appointmentDate ? (
                    formatFullSyrianDate(formData.appointmentDate)
                  ) : (
                    <span>اختر تاريخاً</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.appointmentDate}
                  onSelect={(date) => setFormData({ ...formData, appointmentDate: date || new Date() })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>الوقت</Label>
            <AppointmentTimePicker
              value={formData.time}
              onChange={(time) => setFormData({ ...formData, time })}
              placeholder="اختر الوقت"
            />
          </div>

          <div>
            <Label htmlFor="location">المكان</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="مكان الموعد"
              className="text-right"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSave} 
              className="flex-1"
              disabled={!formData.title.trim()}
            >
              حفظ الموعد
            </Button>
            <Button variant="outline" onClick={handleClose} className="flex-1">
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

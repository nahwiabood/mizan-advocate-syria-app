
import React, { useState } from 'react';
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
import { formatFullSyrianDate } from '@/utils/dateUtils';
import { dataStore } from '@/store/dataStore';

interface AddAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentAdded: () => void;
}

export const AddAppointmentDialog: React.FC<AddAppointmentDialogProps> = ({
  isOpen,
  onClose,
  onAppointmentAdded
}) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    appointmentDate: new Date(),
    time: '',
    duration: 60, // default 60 minutes
    location: ''
  });

  const handleSubmit = async () => {
    if (!form.title || !form.appointmentDate) return;

    try {
      await dataStore.addAppointment({
        title: form.title,
        description: form.description,
        appointmentDate: form.appointmentDate,
        time: form.time || null,
        duration: form.duration,
        location: form.location || null
      });

      setForm({
        title: '',
        description: '',
        appointmentDate: new Date(),
        time: '',
        duration: 60,
        location: ''
      });

      onAppointmentAdded();
      onClose();
    } catch (error) {
      console.error('Error adding appointment:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة موعد جديد</DialogTitle>
        </DialogHeader>
        <div className="space-y-4" dir="rtl">
          <div>
            <Label htmlFor="appointmentTitle">عنوان الموعد</Label>
            <Input
              id="appointmentTitle"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="عنوان الموعد"
              className="text-right"
            />
          </div>

          <div>
            <Label>التاريخ</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-end text-right font-normal",
                    !form.appointmentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {form.appointmentDate ? (
                    formatFullSyrianDate(form.appointmentDate)
                  ) : (
                    <span>اختر تاريخاً</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.appointmentDate}
                  onSelect={(date) => setForm({ ...form, appointmentDate: date || new Date() })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="appointmentTime">الوقت (اختياري)</Label>
            <Input
              id="appointmentTime"
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="text-right"
            />
          </div>

          <div>
            <Label htmlFor="appointmentDuration">المدة (بالدقائق)</Label>
            <Input
              id="appointmentDuration"
              type="number"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 60 })}
              placeholder="60"
              className="text-right"
              min="15"
              step="15"
            />
          </div>

          <div>
            <Label htmlFor="appointmentLocation">المكان (اختياري)</Label>
            <Input
              id="appointmentLocation"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="مكان الموعد"
              className="text-right"
            />
          </div>

          <div>
            <Label htmlFor="appointmentDescription">الوصف (اختياري)</Label>
            <Textarea
              id="appointmentDescription"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="تفاصيل الموعد"
              className="text-right"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              إلغاء
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!form.title || !form.appointmentDate}
            >
              إضافة الموعد
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

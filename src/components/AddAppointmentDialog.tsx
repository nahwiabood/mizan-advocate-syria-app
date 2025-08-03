
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { dataStore } from '@/store/dataStore';
import { formatSyrianDate } from '@/utils/dateUtils';

interface AddAppointmentDialogProps {
  onAppointmentAdded: () => void;
  selectedDate?: Date;
}

export const AddAppointmentDialog: React.FC<AddAppointmentDialogProps> = ({
  onAppointmentAdded,
  selectedDate
}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [appointmentDate, setAppointmentDate] = useState<Date>(selectedDate || new Date());
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [clientName, setClientName] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await dataStore.addAppointment({
        title,
        description,
        appointmentDate,
        time,
        duration,
        clientName,
        location
      });

      // Reset form
      setTitle('');
      setDescription('');
      setAppointmentDate(selectedDate || new Date());
      setTime('');
      setDuration(60);
      setClientName('');
      setLocation('');
      
      setOpen(false);
      onAppointmentAdded();
    } catch (error) {
      console.error('Error adding appointment:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <Plus className="h-4 w-4 ml-2" />
          إضافة موعد جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-right">إضافة موعد جديد</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان الموعد *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientName">اسم الموكل</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-right"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>تاريخ الموعد *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-right"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatSyrianDate(appointmentDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={appointmentDate}
                    onSelect={(date) => date && setAppointmentDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">وقت الموعد</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">مدة الموعد (بالدقائق)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                min="15"
                max="480"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">المكان</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="text-right"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              إضافة الموعد
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dataStore } from '@/store/dataStore';
import { formatSyrianDate } from '@/utils/dateUtils';

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: () => void;
}

export const AddTaskDialog: React.FC<AddTaskDialogProps> = ({
  isOpen,
  onClose,
  onTaskAdded
}) => {
  const [formData, setFormData] = useState({
    title: '',
    dueDate: null as Date | null,
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      return;
    }

    try {
      const newTask = {
        title: formData.title,
        dueDate: formData.dueDate?.toISOString(),
        priority: formData.priority,
        isCompleted: false
      };

      await dataStore.createTask(newTask);
      onTaskAdded();
      onClose();
      setFormData({
        title: '',
        dueDate: null,
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة مهمة جديدة</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
          <div>
            <Label htmlFor="title" className="text-right">عنوان المهمة *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="text-right"
              placeholder="أدخل عنوان المهمة"
              required
            />
          </div>

          <div>
            <Label className="text-right">تاريخ الاستحقاق</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-end text-right font-normal",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  {formData.dueDate ? (
                    formatSyrianDate(formData.dueDate)
                  ) : (
                    <span>اختر التاريخ (اختياري)</span>
                  )}
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => handleInputChange('dueDate', date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-right">الأولوية</Label>
            <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
              <SelectTrigger className="text-right">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">منخفضة</SelectItem>
                <SelectItem value="medium">متوسطة</SelectItem>
                <SelectItem value="high">عالية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              إلغاء
            </Button>
            <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
              إضافة المهمة
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

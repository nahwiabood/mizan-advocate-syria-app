
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFullSyrianDate } from '@/utils/dateUtils';
import { Task } from '@/types';

interface EditTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (updatedTask: Task) => Promise<void>;
}

export const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
  isOpen,
  onClose,
  task,
  onSave
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: null as Date | null,
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        priority: task.priority
      });
    }
  }, [task]);

  const handleSave = async () => {
    if (!task || !formData.title.trim()) return;

    try {
      const updatedTask: Task = {
        ...task,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        dueDate: formData.dueDate,
        priority: formData.priority,
        updatedAt: new Date()
      };

      await onSave(updatedTask);
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: null,
      priority: 'medium'
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل المهمة</DialogTitle>
        </DialogHeader>
        <div className="space-y-4" dir="rtl">
          <div>
            <Label htmlFor="title">عنوان المهمة *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="عنوان المهمة"
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
              placeholder="وصف المهمة (اختياري)"
              className="text-right min-h-20"
              rows={3}
            />
          </div>
          
          <div>
            <Label>تاريخ الاستحقاق</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-end text-right font-normal",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {formData.dueDate ? (
                    formatFullSyrianDate(formData.dueDate)
                  ) : (
                    <span>اختر تاريخ الاستحقاق</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => setFormData({ ...formData, dueDate: date || null })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label>الأولوية</Label>
            <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => 
              setFormData({ ...formData, priority: value })
            }>
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
            <Button 
              onClick={handleSave} 
              className="flex-1"
              disabled={!formData.title.trim()}
            >
              حفظ التعديلات
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


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFullSyrianDate } from '@/utils/dateUtils';

interface EditEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entry: any;
  onSave: (updatedEntry: any) => Promise<void>;
  type: 'income' | 'expense' | 'client_payment' | 'client_expense' | 'case_payment' | 'case_expense' | 'office_income' | 'office_expense';
}

export const EditEntryDialog: React.FC<EditEntryDialogProps> = ({
  isOpen,
  onClose,
  entry,
  onSave,
  type
}) => {
  const [formData, setFormData] = useState({
    description: entry?.description || '',
    amount: entry?.amount?.toString() || '',
    date: entry?.payment_date || entry?.expense_date || entry?.income_date || entry?.fee_date || new Date()
  });

  const handleSave = async () => {
    await onSave({
      ...entry,
      description: formData.description,
      amount: parseFloat(formData.amount),
      [getDateField()]: formData.date
    });
    onClose();
  };

  const getDateField = () => {
    switch (type) {
      case 'client_payment':
      case 'case_payment':
        return 'payment_date';
      case 'client_expense':
      case 'case_expense':
      case 'office_expense':
        return 'expense_date';
      case 'office_income':
        return 'income_date';
      default:
        return 'date';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل القيد المحاسبي</DialogTitle>
        </DialogHeader>
        <div className="space-y-4" dir="rtl">
          <div>
            <Label htmlFor="description">البيان</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف القيد"
              className="text-right"
            />
          </div>
          <div>
            <Label htmlFor="amount">المبلغ</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="المبلغ"
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
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {formData.date ? (
                    formatFullSyrianDate(new Date(formData.date))
                  ) : (
                    <span>اختر تاريخاً</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(formData.date)}
                  onSelect={(date) => setFormData({ ...formData, date: date || new Date() })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              حفظ
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

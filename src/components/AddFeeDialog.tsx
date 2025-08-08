
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dataStore } from '@/store/dataStore';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface AddFeeDialogProps {
  clientId: string;
  onFeeAdded: () => void;
}

export default function AddFeeDialog({ clientId, onFeeAdded }: AddFeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    feeDate: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim() || !formData.amount) {
      toast({
        title: 'خطأ',
        description: 'جميع الحقول مطلوبة',
        variant: 'destructive'
      });
      return;
    }

    try {
      await dataStore.addClientFee({
        clientId,
        description: formData.description,
        amount: parseFloat(formData.amount),
        feeDate: new Date(formData.feeDate)
      });
      toast({
        title: 'نجح',
        description: 'تم إضافة الأتعاب بنجاح'
      });
      setFormData({
        description: '',
        amount: '',
        feeDate: new Date().toISOString().split('T')[0]
      });
      setOpen(false);
      onFeeAdded();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في إضافة الأتعاب',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 ml-2" />
          إضافة أتعاب
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة أتعاب</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">الوصف *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">المبلغ *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="feeDate">تاريخ الأتعاب *</Label>
            <Input
              id="feeDate"
              type="date"
              value={formData.feeDate}
              onChange={(e) => setFormData(prev => ({ ...prev, feeDate: e.target.value }))}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">حفظ</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

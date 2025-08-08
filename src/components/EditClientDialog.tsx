
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { dataStore } from '@/store/dataStore';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/types';

interface EditClientDialogProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onClientUpdated: () => void;
}

export default function EditClientDialog({ client, isOpen, onClose, onClientUpdated }: EditClientDialogProps) {
  const [formData, setFormData] = useState({
    name: client.name,
    phone: client.phone || '',
    email: client.email || '',
    address: client.address || '',
    nationalId: client.nationalId || '',
    notes: client.notes || ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'خطأ',
        description: 'اسم الموكل مطلوب',
        variant: 'destructive'
      });
      return;
    }

    try {
      await dataStore.updateClient(client.id, formData);
      toast({
        title: 'نجح',
        description: 'تم تحديث الموكل بنجاح'
      });
      onClose();
      onClientUpdated();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث الموكل',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تعديل الموكل</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">الاسم *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="address">العنوان</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="nationalId">الرقم الوطني</Label>
            <Input
              id="nationalId"
              value={formData.nationalId}
              onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit">حفظ</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

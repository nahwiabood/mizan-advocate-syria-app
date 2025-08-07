
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dataStore } from '@/store/dataStore';
import { Session } from '@/types';
import { formatFullSyrianDate } from '@/utils/dateUtils';

interface EditSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
  onSessionUpdated: () => void;
}

export const EditSessionDialog: React.FC<EditSessionDialogProps> = ({
  isOpen,
  onClose,
  session,
  onSessionUpdated
}) => {
  const [formData, setFormData] = useState({
    courtName: '',
    caseNumber: '',
    clientName: '',
    opponent: '',
    sessionDate: new Date(),
    nextSessionDate: null as Date | null,
    postponementReason: '',
    nextPostponementReason: ''
  });

  useEffect(() => {
    if (session) {
      setFormData({
        courtName: session.courtName,
        caseNumber: session.caseNumber,
        clientName: session.clientName,
        opponent: session.opponent || '',
        sessionDate: new Date(session.sessionDate),
        nextSessionDate: session.nextSessionDate ? new Date(session.nextSessionDate) : null,
        postponementReason: session.postponementReason || '',
        nextPostponementReason: session.nextPostponementReason || ''
      });
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedSession = {
        courtName: formData.courtName,
        caseNumber: formData.caseNumber,
        clientName: formData.clientName,
        opponent: formData.opponent,
        sessionDate: formData.sessionDate,
        nextSessionDate: formData.nextSessionDate,
        postponementReason: formData.postponementReason,
        nextPostponementReason: formData.nextPostponementReason
      };

      console.log('Updating session:', session.id, updatedSession);
      const result = await dataStore.updateSession(session.id, updatedSession);
      console.log('Update result:', result);
      
      if (result) {
        onSessionUpdated();
        onClose();
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل الجلسة</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
          <div>
            <Label htmlFor="courtName" className="text-right">اسم المحكمة *</Label>
            <Input
              id="courtName"
              value={formData.courtName}
              onChange={(e) => handleInputChange('courtName', e.target.value)}
              className="text-right"
              required
            />
          </div>

          <div>
            <Label htmlFor="caseNumber" className="text-right">رقم القضية *</Label>
            <Input
              id="caseNumber"
              value={formData.caseNumber}
              onChange={(e) => handleInputChange('caseNumber', e.target.value)}
              className="text-right"
              required
            />
          </div>

          <div>
            <Label htmlFor="clientName" className="text-right">اسم الموكل *</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              className="text-right"
              required
            />
          </div>

          <div>
            <Label htmlFor="opponent" className="text-right">الخصم</Label>
            <Input
              id="opponent"
              value={formData.opponent}
              onChange={(e) => handleInputChange('opponent', e.target.value)}
              className="text-right"
              placeholder="اسم الخصم"
            />
          </div>

          <div>
            <Label className="text-right">تاريخ الجلسة *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-end text-right font-normal",
                    !formData.sessionDate && "text-muted-foreground"
                  )}
                >
                  {formData.sessionDate ? (
                    formatFullSyrianDate(formData.sessionDate)
                  ) : (
                    <span>اختر تاريخ الجلسة</span>
                  )}
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.sessionDate}
                  onSelect={(date) => date && handleInputChange('sessionDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-right">تاريخ الجلسة القادمة</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-end text-right font-normal",
                    !formData.nextSessionDate && "text-muted-foreground"
                  )}
                >
                  {formData.nextSessionDate ? (
                    formatFullSyrianDate(formData.nextSessionDate)
                  ) : (
                    <span>اختر تاريخ الجلسة القادمة</span>
                  )}
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.nextSessionDate}
                  onSelect={(date) => handleInputChange('nextSessionDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="postponementReason" className="text-right">سبب التأجيل</Label>
            <Textarea
              id="postponementReason"
              value={formData.postponementReason}
              onChange={(e) => handleInputChange('postponementReason', e.target.value)}
              className="text-right resize-none"
              rows={3}
              placeholder="سبب تأجيل الجلسة (إن وجد)"
            />
          </div>

          <div>
            <Label htmlFor="nextPostponementReason" className="text-right">سبب التأجيل القادم</Label>
            <Textarea
              id="nextPostponementReason"
              value={formData.nextPostponementReason}
              onChange={(e) => handleInputChange('nextPostponementReason', e.target.value)}
              className="text-right resize-none"
              rows={3}
              placeholder="سبب التأجيل للجلسة القادمة (إن وجد)"
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

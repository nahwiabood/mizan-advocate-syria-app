
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';

interface ResolutionDialogProps {
  onResolve: (decisionNumber: string, resolutionResult: string) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ResolutionDialog: React.FC<ResolutionDialogProps> = ({
  onResolve,
  isOpen,
  onOpenChange,
}) => {
  const [decisionNumber, setDecisionNumber] = useState('');
  const [resolutionResult, setResolutionResult] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (decisionNumber.trim() && resolutionResult.trim()) {
      onResolve(decisionNumber.trim(), resolutionResult.trim());
      setDecisionNumber('');
      setResolutionResult('');
      onOpenChange?.(false);
    }
  };

  const content = (
    <DialogContent className="sm:max-w-md" dir="rtl">
      <DialogHeader>
        <DialogTitle className="text-right">حسم الجلسة/المرحلة</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="decisionNumber" className="text-right">
            رقم القرار
          </Label>
          <Input
            id="decisionNumber"
            value={decisionNumber}
            onChange={(e) => setDecisionNumber(e.target.value)}
            placeholder="أدخل رقم القرار"
            required
            className="text-right"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="resolutionResult" className="text-right">
            نتيجة القرار
          </Label>
          <Textarea
            id="resolutionResult"
            value={resolutionResult}
            onChange={(e) => setResolutionResult(e.target.value)}
            placeholder="أدخل نتيجة القرار"
            required
            className="text-right min-h-20"
          />
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
          >
            إلغاء
          </Button>
          <Button type="submit" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            حسم
          </Button>
        </div>
      </form>
    </DialogContent>
  );

  if (isOpen !== undefined && onOpenChange) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <CheckCircle className="h-4 w-4" />
          حسمت
        </Button>
      </DialogTrigger>
      {content}
    </Dialog>
  );
};

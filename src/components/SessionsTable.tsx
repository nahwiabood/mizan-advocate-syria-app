
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Session } from '@/types';
import { formatSyrianDate, formatSyrianTime, isHolidayOrWeekend, getSyrianHoliday } from '@/utils/dateUtils';
import { dataStore } from '@/store/dataStore';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SessionsTableProps {
  sessions: Session[];
  onSessionUpdate: () => void;
  selectedDate?: Date;
}

export const SessionsTable: React.FC<SessionsTableProps> = ({ 
  sessions, 
  onSessionUpdate,
  selectedDate 
}) => {
  const [transferDate, setTransferDate] = useState<Date>();
  const [transferReason, setTransferReason] = useState('');
  const [transferingSessionId, setTransferingSessionId] = useState<string | null>(null);
  const [showHolidayWarning, setShowHolidayWarning] = useState(false);
  const [holidayWarningData, setHolidayWarningData] = useState<{
    sessionId: string;
    date: Date;
    reason: string;
    holidayName?: string;
  } | null>(null);

  const handleTransferSession = async (sessionId: string, newDate: Date, reason: string) => {
    try {
      // Check if the target date is a holiday or weekend
      if (isHolidayOrWeekend(newDate)) {
        const holidayName = getSyrianHoliday(newDate);
        setHolidayWarningData({
          sessionId,
          date: newDate,
          reason,
          holidayName: holidayName || 'عطلة أسبوعية'
        });
        setShowHolidayWarning(true);
        return;
      }

      await dataStore.transferSession(sessionId, newDate, reason);
      setTransferDate(undefined);
      setTransferReason('');
      setTransferingSessionId(null);
      onSessionUpdate();
      toast.success('تم ترحيل الجلسة بنجاح');
    } catch (error) {
      console.error('Error transferring session:', error);
      toast.error('حدث خطأ في ترحيل الجلسة');
    }
  };

  const confirmHolidayTransfer = async () => {
    if (!holidayWarningData) return;

    try {
      await dataStore.transferSession(
        holidayWarningData.sessionId,
        holidayWarningData.date,
        holidayWarningData.reason
      );
      
      setTransferDate(undefined);
      setTransferReason('');
      setTransferingSessionId(null);
      setShowHolidayWarning(false);
      setHolidayWarningData(null);
      onSessionUpdate();
      toast.success('تم ترحيل الجلسة بنجاح');
    } catch (error) {
      console.error('Error transferring session:', error);
      toast.error('حدث خطأ في ترحيل الجلسة');
    }
  };

  const handleResolveSession = async (sessionId: string) => {
    try {
      await dataStore.resolveSession(sessionId);
      onSessionUpdate();
      toast.success('تم إغلاق الجلسة بنجاح');
    } catch (error) {
      console.error('Error resolving session:', error);
      toast.error('حدث خطأ في إغلاق الجلسة');
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        لا توجد جلسات في هذا التاريخ
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="border rounded-lg p-4 space-y-3 bg-card">
            {/* Session Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-right">{session.clientName}</h3>
                <p className="text-sm text-muted-foreground text-right">
                  {session.courtName} - رقم القضية: {session.caseNumber}
                </p>
                <p className="text-sm text-muted-foreground text-right">
                  الخصم: {session.opponent}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 ml-1" />
                  {formatSyrianDate(new Date(session.sessionDate))}
                </Badge>
                {session.isResolved && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 ml-1" />
                    مغلقة
                  </Badge>
                )}
              </div>
            </div>

            {/* Postponement Info */}
            {session.postponementReason && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-right">
                <p className="text-sm font-medium text-yellow-800">سبب التأجيل:</p>
                <p className="text-sm text-yellow-700">{session.postponementReason}</p>
              </div>
            )}

            {/* Next Session Info */}
            {session.nextSessionDate && !session.isResolved && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-right">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-800">الجلسة القادمة:</p>
                </div>
                <p className="text-sm text-blue-700">
                  {formatSyrianDate(new Date(session.nextSessionDate))}
                </p>
                {session.nextPostponementReason && (
                  <p className="text-xs text-blue-600 mt-1">
                    السبب: {session.nextPostponementReason}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            {!session.isResolved && (
              <div className="flex gap-2 pt-2 border-t">
                {transferingSessionId === session.id ? (
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm">تاريخ الترحيل الجديد</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-right text-sm"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {transferDate ? formatSyrianDate(transferDate) : 'اختر التاريخ'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={transferDate}
                              onSelect={setTransferDate}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm">سبب الترحيل</Label>
                        <Input
                          value={transferReason}
                          onChange={(e) => setTransferReason(e.target.value)}
                          placeholder="أدخل سبب الترحيل"
                          className="text-right text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => transferDate && handleTransferSession(session.id, transferDate, transferReason)}
                        disabled={!transferDate || !transferReason}
                        className="flex-1"
                      >
                        تأكيد الترحيل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTransferingSessionId(null);
                          setTransferDate(undefined);
                          setTransferReason('');
                        }}
                        className="flex-1"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTransferingSessionId(session.id)}
                      className="flex-1"
                    >
                      <ArrowRight className="h-4 w-4 ml-1" />
                      ترحيل الجلسة
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleResolveSession(session.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 ml-1" />
                      إغلاق الجلسة
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Holiday Warning Dialog */}
      <AlertDialog open={showHolidayWarning} onOpenChange={setShowHolidayWarning}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-right">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              تحذير: تاريخ عطلة
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              التاريخ المحدد ({holidayWarningData && formatSyrianDate(holidayWarningData.date)}) 
              يصادف {holidayWarningData?.holidayName}. هل تريد المتابعة بترحيل الجلسة إلى هذا التاريخ؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel onClick={() => {
              setShowHolidayWarning(false);
              setHolidayWarningData(null);
            }}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmHolidayTransfer}
              className="bg-amber-600 hover:bg-amber-700"
            >
              المتابعة رغم العطلة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Edit, Calendar as CalendarIconLucide } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { dataStore } from '@/store/dataStore';
import { Session } from '@/types';
import { formatSyrianDate } from '@/utils/dateUtils';

interface SessionsTableProps {
  sessions: Session[];
  title: string;
  onSessionUpdate?: () => void;
}

export const SessionsTable: React.FC<SessionsTableProps> = ({
  sessions,
  title,
  onSessionUpdate,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [editData, setEditData] = useState({
    sessionDate: undefined as Date | undefined,
    postponementReason: '',
    nextSessionDate: undefined as Date | undefined,
    nextPostponementReason: '',
    isResolved: false,
    resolutionDate: undefined as Date | undefined,
    decisionNumber: '',
    decisionSummary: '',
  });

  const openEditDialog = (session: Session) => {
    setSelectedSession(session);
    setEditData({
      sessionDate: session.sessionDate,
      postponementReason: session.postponementReason || '',
      nextSessionDate: session.nextSessionDate || undefined,
      nextPostponementReason: session.nextPostponementReason || '',
      isResolved: session.isResolved || false,
      resolutionDate: session.resolutionDate || undefined,
      decisionNumber: session.decisionNumber || '',
      decisionSummary: session.decisionSummary || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedSession) return;

    dataStore.updateSession(selectedSession.id, {
      sessionDate: editData.sessionDate || selectedSession.sessionDate,
      postponementReason: editData.postponementReason,
      nextSessionDate: editData.nextSessionDate,
      nextPostponementReason: editData.nextPostponementReason,
      isResolved: editData.isResolved,
      resolutionDate: editData.resolutionDate,
      decisionNumber: editData.decisionNumber,
      decisionSummary: editData.decisionSummary,
    });

    setIsEditDialogOpen(false);
    setSelectedSession(null);
    onSessionUpdate?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right flex items-center gap-2">
          <CalendarIconLucide className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد جلسات
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-right">اسم الموكل</th>
                  <th className="p-3 text-right">المحكمة</th>
                  <th className="p-3 text-right">رقم الأساس</th>
                  <th className="p-3 text-right">الخصم</th>
                  <th className="p-3 text-right">تاريخ الجلسة</th>
                  <th className="p-3 text-right">سبب التأجيل</th>
                  <th className="p-3 text-right">الجلسة القادمة</th>
                  <th className="p-3 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">{session.clientName}</td>
                    <td className="p-3">{session.courtName}</td>
                    <td className="p-3">{session.caseNumber}</td>
                    <td className="p-3">{session.opponent}</td>
                    <td className="p-3">{formatSyrianDate(session.sessionDate)}</td>
                    <td className="p-3">{session.postponementReason || '-'}</td>
                    <td className="p-3">
                      {session.nextSessionDate ? formatSyrianDate(session.nextSessionDate) : '-'}
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(session)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Edit Session Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل الجلسة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-right">
              <Label className="text-right">تاريخ الجلسة</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !editData.sessionDate && "text-muted-foreground"
                    )}
                    dir="rtl"
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {editData.sessionDate ? (
                      formatSyrianDate(editData.sessionDate)
                    ) : (
                      <span>اختر التاريخ</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editData.sessionDate}
                    onSelect={(date) => setEditData({ ...editData, sessionDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="text-right">
              <Label htmlFor="edit-postponement" className="text-right">سبب التأجيل</Label>
              <Textarea
                id="edit-postponement"
                value={editData.postponementReason}
                onChange={(e) => setEditData({ ...editData, postponementReason: e.target.value })}
                placeholder="سبب التأجيل"
                className="text-right"
                dir="rtl"
              />
            </div>

            <div className="text-right">
              <Label className="text-right">تاريخ الجلسة القادمة</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !editData.nextSessionDate && "text-muted-foreground"
                    )}
                    dir="rtl"
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {editData.nextSessionDate ? (
                      formatSyrianDate(editData.nextSessionDate)
                    ) : (
                      <span>اختر التاريخ</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editData.nextSessionDate}
                    onSelect={(date) => setEditData({ ...editData, nextSessionDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="text-right">
              <Label htmlFor="edit-next-postponement" className="text-right">سبب التأجيل القادم</Label>
              <Textarea
                id="edit-next-postponement"
                value={editData.nextPostponementReason}
                onChange={(e) => setEditData({ ...editData, nextPostponementReason: e.target.value })}
                placeholder="سبب التأجيل القادم"
                className="text-right"
                dir="rtl"
              />
            </div>

            <div className="flex items-center space-x-2 text-right">
              <Checkbox
                id="resolved"
                checked={editData.isResolved}
                onCheckedChange={(checked) => setEditData({ ...editData, isResolved: checked as boolean })}
              />
              <Label htmlFor="resolved" className="text-right">حُسمت</Label>
            </div>

            {editData.isResolved && (
              <>
                <div className="text-right">
                  <Label className="text-right">تاريخ الحسم</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-right font-normal",
                          !editData.resolutionDate && "text-muted-foreground"
                        )}
                        dir="rtl"
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {editData.resolutionDate ? (
                          formatSyrianDate(editData.resolutionDate)
                        ) : (
                          <span>اختر التاريخ</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editData.resolutionDate}
                        onSelect={(date) => setEditData({ ...editData, resolutionDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="text-right">
                  <Label htmlFor="edit-decision-number" className="text-right">رقم القرار</Label>
                  <Input
                    id="edit-decision-number"
                    value={editData.decisionNumber}
                    onChange={(e) => setEditData({ ...editData, decisionNumber: e.target.value })}
                    placeholder="رقم القرار"
                    className="text-right"
                    dir="rtl"
                  />
                </div>

                <div className="text-right">
                  <Label htmlFor="edit-decision-summary" className="text-right">ملخص القرار</Label>
                  <Textarea
                    id="edit-decision-summary"
                    value={editData.decisionSummary}
                    onChange={(e) => setEditData({ ...editData, decisionSummary: e.target.value })}
                    placeholder="ملخص القرار"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </>
            )}

            <Button onClick={handleSaveEdit} className="w-full">
              حفظ التعديلات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { formatSyrianDate, formatFullSyrianDate } from '@/utils/dateUtils';
import { Session } from '@/types';
import { dataStore } from '@/store/dataStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SessionsTableProps {
  sessions: Session[];
  selectedDate: Date;
  onSessionUpdate: () => void;
}

export const SessionsTable: React.FC<SessionsTableProps> = ({
  sessions,
  selectedDate,
  onSessionUpdate,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [newSession, setNewSession] = useState({
    courtName: '',
    caseNumber: '',
    clientName: '',
    opponent: '',
    postponementReason: '',
  });
  const [transferData, setTransferData] = useState({
    nextDate: undefined as Date | undefined,
    reason: '',
  });

  const handleAddSession = () => {
    if (!newSession.courtName || !newSession.caseNumber || !newSession.clientName) {
      return;
    }

    dataStore.addSession({
      stageId: '', // This would be set based on case selection
      courtName: newSession.courtName,
      caseNumber: newSession.caseNumber,
      sessionDate: selectedDate,
      clientName: newSession.clientName,
      opponent: newSession.opponent,
      postponementReason: newSession.postponementReason,
      isTransferred: false,
    });

    setNewSession({
      courtName: '',
      caseNumber: '',
      clientName: '',
      opponent: '',
      postponementReason: '',
    });
    setIsAddDialogOpen(false);
    onSessionUpdate();
  };

  const handleTransferSession = () => {
    if (!selectedSession || !transferData.nextDate || !transferData.reason) {
      return;
    }

    dataStore.transferSession(selectedSession.id, transferData.nextDate, transferData.reason);
    
    setTransferData({ nextDate: undefined, reason: '' });
    setIsTransferDialogOpen(false);
    setSelectedSession(null);
    onSessionUpdate();
  };

  const openTransferDialog = (session: Session) => {
    setSelectedSession(session);
    setIsTransferDialogOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>جلسات {formatFullSyrianDate(selectedDate)}</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة جلسة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة جلسة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="courtName">المحكمة</Label>
                  <Input
                    id="courtName"
                    value={newSession.courtName}
                    onChange={(e) => setNewSession({ ...newSession, courtName: e.target.value })}
                    placeholder="اسم المحكمة"
                  />
                </div>
                <div>
                  <Label htmlFor="caseNumber">رقم الأساس</Label>
                  <Input
                    id="caseNumber"
                    value={newSession.caseNumber}
                    onChange={(e) => setNewSession({ ...newSession, caseNumber: e.target.value })}
                    placeholder="رقم الأساس"
                  />
                </div>
                <div>
                  <Label htmlFor="clientName">الموكل</Label>
                  <Input
                    id="clientName"
                    value={newSession.clientName}
                    onChange={(e) => setNewSession({ ...newSession, clientName: e.target.value })}
                    placeholder="اسم الموكل"
                  />
                </div>
                <div>
                  <Label htmlFor="opponent">الخصم</Label>
                  <Input
                    id="opponent"
                    value={newSession.opponent}
                    onChange={(e) => setNewSession({ ...newSession, opponent: e.target.value })}
                    placeholder="اسم الخصم"
                  />
                </div>
                <div>
                  <Label htmlFor="postponementReason">سبب التأجيل</Label>
                  <Textarea
                    id="postponementReason"
                    value={newSession.postponementReason}
                    onChange={(e) => setNewSession({ ...newSession, postponementReason: e.target.value })}
                    placeholder="سبب التأجيل (اختياري)"
                  />
                </div>
                <Button onClick={handleAddSession} className="w-full">
                  إضافة الجلسة
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد جلسات في هذا التاريخ
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">المحكمة:</span>
                    <p className="font-medium">{session.courtName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">رقم الأساس:</span>
                    <p className="font-medium">{session.caseNumber}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">الموكل:</span>
                    <p className="font-medium">{session.clientName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">الخصم:</span>
                    <p className="font-medium">{session.opponent}</p>
                  </div>
                </div>
                
                {session.postponementReason && (
                  <div>
                    <span className="text-sm text-muted-foreground">سبب التأجيل:</span>
                    <p className="font-medium">{session.postponementReason}</p>
                  </div>
                )}
                
                {session.nextSessionDate ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">الجلسة القادمة:</span>
                      <p className="font-medium">{formatSyrianDate(session.nextSessionDate)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">سبب التأجيل القادم:</span>
                      <p className="font-medium">{session.nextPostponementReason}</p>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => openTransferDialog(session)}
                    className="w-full"
                  >
                    الجلسة القادمة
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Transfer Session Dialog */}
        <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>ترحيل الجلسة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>تاريخ الجلسة القادمة</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right font-normal",
                        !transferData.nextDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {transferData.nextDate ? (
                        formatSyrianDate(transferData.nextDate)
                      ) : (
                        <span>اختر التاريخ</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={transferData.nextDate}
                      onSelect={(date) => setTransferData({ ...transferData, nextDate: date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor="transferReason">سبب التأجيل</Label>
                <Textarea
                  id="transferReason"
                  value={transferData.reason}
                  onChange={(e) => setTransferData({ ...transferData, reason: e.target.value })}
                  placeholder="أدخل سبب التأجيل"
                />
              </div>
              
              <Button onClick={handleTransferSession} className="w-full">
                ترحيل الجلسة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { formatSyrianDate, formatFullSyrianDate } from '@/utils/dateUtils';
import { Session } from '@/types';
import { dataStore } from '@/store/dataStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SessionsTableProps {
  sessions: Session[];
  selectedDate: Date;
  onSessionUpdate: () => void;
  showAddButton?: boolean;
}

export const SessionsTable: React.FC<SessionsTableProps> = ({
  sessions,
  selectedDate,
  onSessionUpdate,
  showAddButton = true
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

  const handleEditSession = () => {
    if (!selectedSession) return;
    
    dataStore.updateSession(selectedSession.id, {
      courtName: newSession.courtName || selectedSession.courtName,
      caseNumber: newSession.caseNumber || selectedSession.caseNumber,
      clientName: newSession.clientName || selectedSession.clientName,
      opponent: newSession.opponent || selectedSession.opponent,
      postponementReason: newSession.postponementReason || selectedSession.postponementReason,
    });
    
    setIsEditDialogOpen(false);
    setSelectedSession(null);
    setNewSession({
      courtName: '',
      caseNumber: '',
      clientName: '',
      opponent: '',
      postponementReason: '',
    });
    onSessionUpdate();
  };

  const handleDeleteSession = () => {
    if (!selectedSession) return;
    
    dataStore.deleteSession(selectedSession.id);
    setIsEditDialogOpen(false);
    setSelectedSession(null);
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

  const openEditDialog = (session: Session) => {
    setSelectedSession(session);
    setNewSession({
      courtName: session.courtName,
      caseNumber: session.caseNumber,
      clientName: session.clientName,
      opponent: session.opponent,
      postponementReason: session.postponementReason || '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (session: Session) => {
    setSelectedSession(session);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>جلسات {formatFullSyrianDate(selectedDate)}</CardTitle>
          {showAddButton && (
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
          )}
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
              <div key={session.id} className="border rounded-lg p-4">
                <div className="grid grid-cols-6 gap-4 items-center">
                  <div className="col-span-5 grid grid-cols-6 gap-2 text-sm">
                    <div>
                      <span className="font-bold block">تاريخ الجلسة</span>
                      <span>{formatSyrianDate(session.sessionDate)}</span>
                    </div>
                    
                    <div>
                      <span className="font-bold block">المحكمة</span>
                      <span>{session.courtName} / {session.caseNumber}</span>
                    </div>
                    
                    <div>
                      <span className="font-bold block">الموكل</span>
                      <span>{session.clientName}</span>
                    </div>
                    
                    <div>
                      <span className="font-bold block">الخصم</span>
                      <span>{session.opponent}</span>
                    </div>
                    
                    <div>
                      <span className="font-bold block">سبب التأجيل</span>
                      <span>{session.postponementReason || '-'}</span>
                    </div>
                    
                    {session.nextSessionDate && (
                      <div>
                        <span className="font-bold block">القادمة</span>
                        <span>{formatSyrianDate(session.nextSessionDate)}</span>
                        {session.nextPostponementReason && (
                          <div className="mt-1">
                            <span className="font-bold text-xs block">السبب القادم</span>
                            <span className="text-xs">{session.nextPostponementReason}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="col-span-1 flex flex-col gap-2 justify-center">
                    {!session.nextSessionDate && (
                      <Button
                        variant="outline"
                        onClick={() => openTransferDialog(session)}
                        size="sm"
                        className="w-full"
                      >
                        الجلسة القادمة
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(session)}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 ml-1" />
                      تعديل
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Edit Session Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>تعديل الجلسة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-courtName">المحكمة</Label>
                <Input
                  id="edit-courtName"
                  value={newSession.courtName}
                  onChange={(e) => setNewSession({ ...newSession, courtName: e.target.value })}
                  placeholder="اسم المحكمة"
                />
              </div>
              <div>
                <Label htmlFor="edit-caseNumber">رقم الأساس</Label>
                <Input
                  id="edit-caseNumber"
                  value={newSession.caseNumber}
                  onChange={(e) => setNewSession({ ...newSession, caseNumber: e.target.value })}
                  placeholder="رقم الأساس"
                />
              </div>
              <div>
                <Label htmlFor="edit-clientName">الموكل</Label>
                <Input
                  id="edit-clientName"
                  value={newSession.clientName}
                  onChange={(e) => setNewSession({ ...newSession, clientName: e.target.value })}
                  placeholder="اسم الموكل"
                />
              </div>
              <div>
                <Label htmlFor="edit-opponent">الخصم</Label>
                <Input
                  id="edit-opponent"
                  value={newSession.opponent}
                  onChange={(e) => setNewSession({ ...newSession, opponent: e.target.value })}
                  placeholder="اسم الخصم"
                />
              </div>
              <div>
                <Label htmlFor="edit-postponementReason">سبب التأجيل</Label>
                <Textarea
                  id="edit-postponementReason"
                  value={newSession.postponementReason}
                  onChange={(e) => setNewSession({ ...newSession, postponementReason: e.target.value })}
                  placeholder="سبب التأجيل (اختياري)"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEditSession} className="flex-1">
                  حفظ التعديلات
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteSession}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 ml-1" />
                  حذف
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
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

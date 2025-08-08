import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
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
  onWeekendWarning?: (date: Date) => void;
}

export const SessionsTable: React.FC<SessionsTableProps> = ({
  sessions,
  selectedDate,
  onSessionUpdate,
  showAddButton = true,
  onWeekendWarning
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [newSession, setNewSession] = useState({
    courtName: '',
    caseNumber: '',
    clientName: '',
    opponent: '',
    postponementReason: '',
    sessionDate: undefined as Date | undefined,
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
      stageId: '',
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
      sessionDate: undefined,
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
      sessionDate: newSession.sessionDate || selectedSession.sessionDate,
    });
    
    setIsEditDialogOpen(false);
    setSelectedSession(null);
    setNewSession({
      courtName: '',
      caseNumber: '',
      clientName: '',
      opponent: '',
      postponementReason: '',
      sessionDate: undefined,
    });
    onSessionUpdate();
  };

  const handleDeleteSession = () => {
    if (!selectedSession) return;
    
    dataStore.deleteSession(selectedSession.id);
    setIsDeleteDialogOpen(false);
    setSelectedSession(null);
    onSessionUpdate();
  };

  const handleResolveSession = (session: Session) => {
    dataStore.resolveSession(session.id);
    onSessionUpdate();
  };

  const handleTransferSession = () => {
    if (!selectedSession || !transferData.nextDate || !transferData.reason) {
      return;
    }

    if (onWeekendWarning) {
      onWeekendWarning(transferData.nextDate);
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
      sessionDate: session.sessionDate,
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
          <CardTitle className="text-right text-sm sm:text-base truncate">
            جلسات {formatSyrianDate(selectedDate)}
          </CardTitle>
          {showAddButton && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة جلسة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة جلسة جديدة</DialogTitle>
                  <p className="text-sm text-muted-foreground text-right">
                    التاريخ المحدد: {format(selectedDate, 'EEEE, MMMM d, yyyy')} - {formatFullSyrianDate(selectedDate)}
                  </p>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-right">
                    <Label htmlFor="courtName" className="text-right">المحكمة</Label>
                    <Input
                      id="courtName"
                      value={newSession.courtName}
                      onChange={(e) => setNewSession({ ...newSession, courtName: e.target.value })}
                      placeholder="اسم المحكمة"
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div className="text-right">
                    <Label htmlFor="caseNumber" className="text-right">رقم الأساس</Label>
                    <Input
                      id="caseNumber"
                      value={newSession.caseNumber}
                      onChange={(e) => setNewSession({ ...newSession, caseNumber: e.target.value })}
                      placeholder="رقم الأساس"
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div className="text-right">
                    <Label htmlFor="clientName" className="text-right">الموكل</Label>
                    <Input
                      id="clientName"
                      value={newSession.clientName}
                      onChange={(e) => setNewSession({ ...newSession, clientName: e.target.value })}
                      placeholder="اسم الموكل"
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div className="text-right">
                    <Label htmlFor="opponent" className="text-right">الخصم</Label>
                    <Input
                      id="opponent"
                      value={newSession.opponent}
                      onChange={(e) => setNewSession({ ...newSession, opponent: e.target.value })}
                      placeholder="اسم الخصم"
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div className="text-right">
                    <Label htmlFor="postponementReason" className="text-right">سبب التأجيل</Label>
                    <Textarea
                      id="postponementReason"
                      value={newSession.postponementReason}
                      onChange={(e) => setNewSession({ ...newSession, postponementReason: e.target.value })}
                      placeholder="سبب التأجيل (اختياري)"
                      className="text-right"
                      dir="rtl"
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
          <div className="w-full overflow-x-auto">
            <Table dir="rtl" className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right min-w-[180px]">المحكمة</TableHead>
                  <TableHead className="text-right min-w-[120px]">الموكل</TableHead>
                  <TableHead className="text-right min-w-[120px]">الخصم</TableHead>
                  <TableHead className="text-right min-w-[120px]">القادمة</TableHead>
                  <TableHead className="text-right min-w-[150px]">السبب القادم</TableHead>
                  <TableHead className="text-right min-w-[200px]">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="font-medium">{session.courtName}</div>
                        <div className="text-sm text-muted-foreground">{session.caseNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {session.clientName}
                    </TableCell>
                    <TableCell className="text-right">
                      {session.opponent}
                    </TableCell>
                    <TableCell className="text-right">
                      {session.nextSessionDate ? formatSyrianDate(session.nextSessionDate) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {session.nextPostponementReason || session.postponementReason || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 flex-wrap">
                        {session.isResolved ? (
                          <span className="text-green-600 font-semibold">حُسمت</span>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => openTransferDialog(session)}
                              size="sm"
                            >
                              الجلسة القادمة
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleResolveSession(session)}
                              size="sm"
                              className="gap-1 text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                              حُسمت
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(session)}
                          className="gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          تعديل
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Edit Session Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">تعديل الجلسة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-right">
                <Label htmlFor="edit-courtName" className="text-right">المحكمة</Label>
                <Input
                  id="edit-courtName"
                  value={newSession.courtName}
                  onChange={(e) => setNewSession({ ...newSession, courtName: e.target.value })}
                  placeholder="اسم المحكمة"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="edit-caseNumber" className="text-right">رقم الأساس</Label>
                <Input
                  id="edit-caseNumber"
                  value={newSession.caseNumber}
                  onChange={(e) => setNewSession({ ...newSession, caseNumber: e.target.value })}
                  placeholder="رقم الأساس"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="edit-clientName" className="text-right">الموكل</Label>
                <Input
                  id="edit-clientName"
                  value={newSession.clientName}
                  onChange={(e) => setNewSession({ ...newSession, clientName: e.target.value })}
                  placeholder="اسم الموكل"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="edit-opponent" className="text-right">الخصم</Label>
                <Input
                  id="edit-opponent"
                  value={newSession.opponent}
                  onChange={(e) => setNewSession({ ...newSession, opponent: e.target.value })}
                  placeholder="اسم الخصم"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label className="text-right">تاريخ الجلسة</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right font-normal",
                        !newSession.sessionDate && "text-muted-foreground"
                      )}
                      dir="rtl"
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {newSession.sessionDate ? (
                        formatSyrianDate(newSession.sessionDate)
                      ) : (
                        <span>اختر التاريخ</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newSession.sessionDate}
                      onSelect={(date) => setNewSession({ ...newSession, sessionDate: date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="text-right">
                <Label htmlFor="edit-postponementReason" className="text-right">سبب التأجيل</Label>
                <Textarea
                  id="edit-postponementReason"
                  value={newSession.postponementReason}
                  onChange={(e) => setNewSession({ ...newSession, postponementReason: e.target.value })}
                  placeholder="سبب التأجيل (اختياري)"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEditSession} className="flex-1">
                  حفظ التعديلات
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="flex-1 gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-right">
              <p>هل أنت متأكد من رغبتك في حذف هذه الجلسة؟</p>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteSession}
                  className="flex-1"
                >
                  حذف
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Transfer Session Dialog */}
        <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">ترحيل الجلسة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-right">
                <Label className="text-right">تاريخ الجلسة القادمة</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right font-normal",
                        !transferData.nextDate && "text-muted-foreground"
                      )}
                      dir="rtl"
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
              
              <div className="text-right">
                <Label htmlFor="transferReason" className="text-right">سبب التأجيل</Label>
                <Textarea
                  id="transferReason"
                  value={transferData.reason}
                  onChange={(e) => setTransferData({ ...transferData, reason: e.target.value })}
                  placeholder="أدخل سبب التأجيل"
                  className="text-right"
                  dir="rtl"
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

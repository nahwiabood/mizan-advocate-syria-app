
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, ArrowRight, Edit2, Trash2, Calendar } from 'lucide-react';
import { Session } from '@/types';
import { formatSyrianDate } from '@/utils/dateUtils';
import { dataStore } from '@/store/dataStore';
import { EditSessionDialog } from './EditSessionDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SessionsTableProps {
  sessions: Session[];
  onSessionUpdate: () => void;
}

export const SessionsTable: React.FC<SessionsTableProps> = ({ sessions, onSessionUpdate }) => {
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [deleteSession, setDeleteSession] = useState<Session | null>(null);

  const handleResolve = async (sessionId: string) => {
    try {
      await dataStore.resolveSession(sessionId);
      onSessionUpdate();
    } catch (error) {
      console.error('Error resolving session:', error);
    }
  };

  const handleTransfer = async (sessionId: string, nextDate: Date, reason: string) => {
    try {
      await dataStore.transferSession(sessionId, nextDate, reason);
      onSessionUpdate();
    } catch (error) {
      console.error('Error transferring session:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteSession) return;

    try {
      await dataStore.deleteSession(deleteSession.id);
      setDeleteSession(null);
      onSessionUpdate();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleEditComplete = () => {
    setEditingSession(null);
    onSessionUpdate();
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المحكمة</TableHead>
              <TableHead className="text-right">رقم القضية</TableHead>
              <TableHead className="text-right">الموكل</TableHead>
              <TableHead className="text-right">الخصم</TableHead>
              <TableHead className="text-right">تاريخ الجلسة</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الجلسة التالية</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell className="text-right font-medium">{session.courtName}</TableCell>
                <TableCell className="text-right">{session.caseNumber}</TableCell>
                <TableCell className="text-right">{session.clientName}</TableCell>
                <TableCell className="text-right">{session.opponent || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatSyrianDate(session.sessionDate)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {session.isResolved ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      منجزة
                    </Badge>
                  ) : session.isTransferred ? (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <ArrowRight className="h-4 w-4 mr-1" />
                      مؤجلة
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      <XCircle className="h-4 w-4 mr-1" />
                      قائمة
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {session.nextSessionDate ? (
                    <span>{formatSyrianDate(session.nextSessionDate)}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSession(session)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteSession(session)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {!session.isResolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolve(session.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  لا توجد جلسات مسجلة
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editingSession && (
        <EditSessionDialog
          isOpen={true}
          onClose={() => setEditingSession(null)}
          session={editingSession}
          onSessionUpdated={handleEditComplete}
        />
      )}

      <AlertDialog open={!!deleteSession} onOpenChange={() => setDeleteSession(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};


import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Session } from '@/types';
import { formatSyrianDate, isDatePast } from '@/utils/dateUtils';

interface PastSessionsDialogProps {
  sessions: Session[];
  onSelectSession: (date: Date) => void;
}

export const PastSessionsDialog: React.FC<PastSessionsDialogProps> = ({
  sessions,
  onSelectSession,
}) => {
  const pastSessions = sessions.filter(
    session => isDatePast(session.sessionDate) && !session.isTransferred
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          الجلسات غير المرحلة ({pastSessions.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>الجلسات غير المرحلة</DialogTitle>
        </DialogHeader>
        
        {pastSessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد جلسات غير مرحلة
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {pastSessions.map((session) => (
              <div 
                key={session.id} 
                className="border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-muted" 
                onClick={() => onSelectSession(session.sessionDate)}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">التاريخ:</span>
                    <p className="font-medium">{formatSyrianDate(session.sessionDate)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">المحكمة:</span>
                    <p className="font-medium">{session.courtName}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">رقم الأساس:</span>
                    <p className="font-medium">{session.caseNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">الموكل:</span>
                    <p className="font-medium">{session.clientName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

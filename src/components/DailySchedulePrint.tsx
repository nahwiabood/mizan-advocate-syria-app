
import React from 'react';
import { formatSyrianDate, formatSyrianTime, getFullSyrianDayName } from '@/utils/dateUtils';
import { Session, Appointment, Task } from '@/types';

interface DailySchedulePrintProps {
  date: Date;
  sessions: Session[];
  appointments: Appointment[];
  tasks: Task[];
  onClose: () => void;
}

export const DailySchedulePrint: React.FC<DailySchedulePrintProps> = ({
  date,
  sessions,
  appointments,
  tasks,
  onClose
}) => {
  const hasPrintedRef = React.useRef(false);

  React.useEffect(() => {
    if (hasPrintedRef.current) return;
    hasPrintedRef.current = true;

    const handleAfterPrint = () => {
      onClose();
    };

    window.addEventListener('afterprint', handleAfterPrint, { once: true });

    const timeoutId = setTimeout(() => {
      window.print();
    }, 0);

    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
      clearTimeout(timeoutId);
    };
  }, [onClose]);

  const pendingTasks = tasks.filter(task => !task.isCompleted);

  return (
    <div className="print-container bg-white p-8 min-h-screen" style={{ fontFamily: 'Arial, sans-serif' }}>
      <style>
        {`
          @media print {
            body { margin: 0; }
            .print-container { 
              box-shadow: none !important;
              margin: 0 !important;
              padding: 20px !important;
            }
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        `}
      </style>

      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">جدول أعمال اليوم</h1>
        <h2 className="text-xl text-gray-600">{getFullSyrianDayName(date)} - {formatSyrianDate(date)}</h2>
      </div>

      {/* Sessions */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-blue-600 mb-4 border-b border-blue-200 pb-2">
          الجلسات ({sessions.length})
        </h3>
        {sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <div key={session.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg">{index + 1}. جلسة محكمة</h4>
                  <span className="text-sm text-gray-600">{formatSyrianDate(session.sessionDate)}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>المحكمة:</strong> {session.courtName}</div>
                  <div><strong>رقم الدعوى:</strong> {session.caseNumber}</div>
                  <div><strong>الموكل:</strong> {session.clientName}</div>
                  <div><strong>الخصم:</strong> {session.opponent}</div>
                </div>
                {session.postponementReason && (
                  <div className="mt-2 p-2 bg-white rounded border">
                    <strong>سبب التأجيل:</strong> {session.postponementReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">لا توجد جلسات في هذا اليوم</p>
        )}
      </div>

      {/* Appointments */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-purple-600 mb-4 border-b border-purple-200 pb-2">
          المواعيد ({appointments.length})
        </h3>
        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment, index) => (
              <div key={appointment.id} className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg">{index + 1}. {appointment.title}</h4>
                  <span className="text-sm text-gray-600">
                    {formatSyrianDate(appointment.appointmentDate)} 
                    {appointment.time && ` - ${appointment.time}`}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>المدة:</strong> {appointment.duration} دقيقة</div>
                  <div><strong>المكان:</strong> {appointment.location || 'غير محدد'}</div>
                  {appointment.clientName && (
                    <div><strong>العميل:</strong> {appointment.clientName}</div>
                  )}
                </div>
                {appointment.description && (
                  <div className="mt-2 p-2 bg-white rounded border">
                    <strong>الوصف:</strong> {appointment.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">لا توجد مواعيد في هذا اليوم</p>
        )}
      </div>

      {/* Tasks */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-orange-600 mb-4 border-b border-orange-200 pb-2">
          المهام المعلقة ({pendingTasks.length})
        </h3>
        {pendingTasks.length > 0 ? (
          <div className="space-y-3">
            {pendingTasks.map((task, index) => (
              <div key={task.id} className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold">{index + 1}. {task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority === 'high' ? 'عالية' :
                       task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                    </div>
                    {task.dueDate && (
                      <div className="mt-1 text-gray-600">
                        {formatSyrianDate(task.dueDate)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">لا توجد مهام معلقة</p>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 border-t border-gray-300 pt-4 mt-8">
        <p>أجندة - نظام إدارة مكتب المحاماة</p>
        <p>تاريخ الطباعة: {formatSyrianDate(new Date())}</p>
      </div>
    </div>
  );
};

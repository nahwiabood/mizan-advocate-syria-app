
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatSyrianDate, getSyrianMonthName, isDateToday, getFullSyrianDayName, isWeekend, getSyrianHoliday, isSyrianHoliday, isSameDay } from '@/utils/dateUtils';
import { Session, Appointment } from '@/types';

interface ArabicCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  sessions: Session[];
  appointments: Appointment[];
}

export const ArabicCalendar: React.FC<ArabicCalendarProps> = ({
  selectedDate,
  onDateSelect,
  sessions,
  appointments
}) => {
  const today = new Date();
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Create calendar grid
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentYear, currentMonth, day));
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    onDateSelect(newDate);
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.sessionDate);
      const nextSessionDate = session.nextSessionDate ? new Date(session.nextSessionDate) : null;
      
      return isSameDay(sessionDate, date) || 
             (nextSessionDate && isSameDay(nextSessionDate, date));
    });
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.appointmentDate), date)
    );
  };

  const weekDays = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            ←
          </button>
          
          <div className="text-center">
            <h2 className="text-lg font-bold">
              {getSyrianMonthName(currentMonth)} {currentYear}
            </h2>
            <p className="text-sm text-muted-foreground">
              {getFullSyrianDayName(selectedDate)}
            </p>
          </div>
          
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            →
          </button>
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={index} className="h-12"></div>;
            }

            const isSelected = isSameDay(date, selectedDate);
            const isToday = isDateToday(date);
            const isWeekendDay = isWeekend(date);
            const holiday = getSyrianHoliday(date);
            const isHoliday = isSyrianHoliday(date);
            const daySessionsCount = getSessionsForDate(date).length;
            const dayAppointmentsCount = getAppointmentsForDate(date).length;

            return (
              <button
                key={index}
                onClick={() => onDateSelect(date)}
                className={`h-12 p-1 rounded-md text-sm transition-all hover:bg-gray-100 relative ${
                  isSelected
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : isToday
                    ? 'bg-blue-100 text-blue-800 font-bold'
                    : isHoliday
                    ? 'bg-red-100 text-red-800'
                    : isWeekendDay
                    ? 'text-red-600'
                    : 'text-gray-900'
                }`}
                title={holiday || undefined}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-xs">{date.getDate()}</span>
                  
                  {/* Sessions indicator */}
                  {daySessionsCount > 0 && (
                    <div className="flex gap-1 mt-1">
                      <Badge 
                        variant="secondary" 
                        className="text-[10px] px-1 py-0 h-4 bg-green-100 text-green-800"
                      >
                        {daySessionsCount}ج
                      </Badge>
                    </div>
                  )}
                  
                  {/* Appointments indicator */}
                  {dayAppointmentsCount > 0 && (
                    <div className="flex gap-1 mt-1">
                      <Badge 
                        variant="secondary" 
                        className="text-[10px] px-1 py-0 h-4 bg-purple-100 text-purple-800"
                      >
                        {dayAppointmentsCount}م
                      </Badge>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span>ج = جلسات</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-100 rounded"></div>
            <span>م = مواعيد</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

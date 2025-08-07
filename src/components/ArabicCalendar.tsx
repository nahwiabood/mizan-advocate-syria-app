
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react';
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

  const goToToday = () => {
    onDateSelect(new Date());
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

        {/* اليوم Button */}
        <div className="flex justify-center mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="gap-2"
          >
            <CalendarDays className="h-4 w-4" />
            اليوم
          </Button>
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
                  
                  {/* عدد الجلسات والمواعيد */}
                  <div className="flex gap-1 text-[10px] font-bold">
                    {daySessionsCount > 0 && (
                      <span className="text-green-600">{daySessionsCount}</span>
                    )}
                    {dayAppointmentsCount > 0 && (
                      <span className="text-purple-600">{dayAppointmentsCount}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

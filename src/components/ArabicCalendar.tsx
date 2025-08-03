
import React from 'react';
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
              return <div key={index} className="h-16"></div>;
            }

            const isSelected = isSameDay(date, selectedDate);
            const isToday = isDateToday(date);
            const isWeekendDay = isWeekend(date);
            const holiday = getSyrianHoliday(date);
            const isHoliday = isSyrianHoliday(date);
            const daySessionsCount = getSessionsForDate(date).length;
            const dayAppointmentsCount = getAppointmentsForDate(date).length;

            let bgColor = '';
            let textColor = 'text-gray-900';
            
            if (isSelected) {
              bgColor = 'bg-blue-500 text-white hover:bg-blue-600';
              textColor = 'text-white';
            } else if (isToday) {
              bgColor = 'bg-blue-100 text-blue-800 font-bold';
              textColor = 'text-blue-800';
            } else if (isHoliday) {
              bgColor = 'bg-red-100 text-red-800 font-semibold';
              textColor = 'text-red-800';
            } else if (isWeekendDay) {
              bgColor = 'bg-yellow-50 text-red-600';
              textColor = 'text-red-600';
            }

            return (
              <button
                key={index}
                onClick={() => onDateSelect(date)}
                className={`h-16 p-1 rounded-md text-sm transition-all hover:bg-gray-100 relative ${bgColor} ${textColor}`}
                title={holiday || undefined}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-sm mb-1">{date.getDate()}</span>
                  
                  {/* Counters row */}
                  <div className="flex gap-1 text-xs">
                    {/* Sessions count */}
                    {daySessionsCount > 0 && (
                      <span className={`px-1 py-0 rounded text-[10px] ${
                        isSelected ? 'bg-white text-blue-500' : 'bg-green-500 text-white'
                      }`}>
                        {daySessionsCount}
                      </span>
                    )}
                    
                    {/* Appointments count */}
                    {dayAppointmentsCount > 0 && (
                      <span className={`px-1 py-0 rounded text-[10px] ${
                        isSelected ? 'bg-white text-blue-500' : 'bg-purple-500 text-white'
                      }`}>
                        {dayAppointmentsCount}
                      </span>
                    )}
                  </div>
                  
                  {/* Holiday name indicator */}
                  {holiday && (
                    <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-[8px] px-1 rounded-b-md truncate">
                      {holiday}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground justify-center">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>جلسات</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>مواعيد</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span>عطلة أسبوعية</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            <span>عطلة رسمية</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

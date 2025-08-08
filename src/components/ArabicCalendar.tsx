
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

  const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  return (
    <Card className="w-full bg-white">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('next')}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-lg font-bold"
          >
            ‹
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {getSyrianMonthName(currentMonth)} {currentYear}
            </h2>
          </div>
          
          <button
            onClick={() => navigateMonth('prev')}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-lg font-bold"
          >
            ›
          </button>
        </div>

        {/* اليوم Button */}
        <div className="flex justify-center mb-6">
          <Button
            variant="default"
            onClick={goToToday}
            className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <CalendarDays className="h-4 w-4" />
            اليوم
          </Button>
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="h-10 flex items-center justify-center text-sm font-semibold text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
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
            let borderColor = '';

            if (isSelected) {
              bgColor = 'bg-blue-600';
              textColor = 'text-white';
              borderColor = 'border-blue-600';
            } else if (isToday) {
              bgColor = 'bg-blue-600';
              textColor = 'text-white';
              borderColor = 'border-blue-600';
            } else if (isHoliday) {
              bgColor = 'bg-red-500';
              textColor = 'text-white';
            } else if (isWeekendDay) {
              bgColor = 'bg-red-100';
              textColor = 'text-red-700';
            } else {
              bgColor = 'bg-white';
              borderColor = 'border-gray-200';
            }

            return (
              <button
                key={index}
                onClick={() => onDateSelect(date)}
                className={`h-16 p-2 rounded-xl border-2 text-sm transition-all hover:shadow-md relative ${bgColor} ${textColor} ${borderColor}`}
                title={holiday || undefined}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-lg font-bold mb-1">{date.getDate()}</span>
                  
                  {/* عداد الجلسات والمواعيد */}
                  <div className="flex gap-1">
                    {daySessionsCount > 0 && (
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    )}
                    {dayAppointmentsCount > 0 && (
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100"></div>
            <span>عطلة أسبوعية</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-400"></div>
            <span>مواعيد</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-400"></div>
            <span>جلسات</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-600"></div>
            <span>اليوم</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span>عطلة رسمية</span>
          </div>
        </div>

        {/* Selected Date Display */}
        <div className="mt-4 text-center">
          <Badge variant="outline" className="text-lg px-3 py-1">
            {getFullSyrianDayName(selectedDate)} {formatSyrianDate(selectedDate)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

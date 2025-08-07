
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
    <Card className="w-full bg-white shadow-lg">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('next')}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors text-2xl font-bold"
          >
            ‹
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {getSyrianMonthName(currentMonth)} {currentYear}
            </h2>
          </div>
          
          <button
            onClick={() => navigateMonth('prev')}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors text-2xl font-bold"
          >
            ›
          </button>
        </div>

        {/* اليوم Button */}
        <div className="flex justify-center mb-6">
          <Button
            variant="default"
            onClick={goToToday}
            className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-bold"
          >
            <CalendarDays className="h-5 w-5 ml-2" />
            اليوم
          </Button>
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="h-12 flex items-center justify-center text-lg font-bold text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
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

            return (
              <button
                key={index}
                onClick={() => onDateSelect(date)}
                className={`h-16 p-2 rounded-lg text-lg font-bold transition-all hover:bg-gray-100 relative ${
                  isSelected
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : isToday
                    ? 'bg-blue-700 text-white font-bold'
                    : isHoliday || isWeekendDay
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
                title={holiday || undefined}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-lg">{date.getDate()}</span>
                  
                  {/* عدد الجلسات والمواعيد */}
                  <div className="flex gap-1 text-xs font-bold mt-1">
                    {daySessionsCount > 0 && (
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'}`}>
                        {daySessionsCount}
                      </span>
                    )}
                    {dayAppointmentsCount > 0 && (
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-white text-green-600' : 'bg-green-500 text-white'}`}>
                        {dayAppointmentsCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
            <span>عطلة رسمية</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
            <span>عطلة أسبوعية</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>مواعيد</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>جلسات</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-700 rounded"></div>
            <span>اليوم</span>
          </div>
        </div>

        {/* Current selected date */}
        <div className="text-center mt-6">
          <h3 className="text-xl font-bold text-gray-800">
            {getFullSyrianDayName(selectedDate)} {formatSyrianDate(selectedDate)}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
};

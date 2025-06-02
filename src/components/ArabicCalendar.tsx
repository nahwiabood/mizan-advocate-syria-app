import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIconLucide } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatSyrianDate, getSyrianMonthName, isDateToday, getFullSyrianDayName, isWeekend, getSyrianHoliday, isSyrianHoliday } from '@/utils/dateUtils';
import { Session, Appointment } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';

interface ArabicCalendarProps {
  sessions: Session[];
  appointments: Appointment[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const ArabicCalendar: React.FC<ArabicCalendarProps> = ({
  sessions,
  appointments,
  selectedDate,
  onDateSelect,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedHolidayName, setSelectedHolidayName] = useState<string>('');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfMonth = getDay(monthStart);
  const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session => 
      isSameDay(session.sessionDate, date)
    );
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(appointment.appointmentDate, date)
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect(today);
    setSelectedHolidayName('');
  };

  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
    const holidayName = getSyrianHoliday(date);
    setSelectedHolidayName(holidayName || '');
  };

  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">
            {getSyrianMonthName(currentMonth.getMonth())} {currentMonth.getFullYear()}
          </CardTitle>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="p-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {selectedHolidayName && (
          <div className="text-center mt-2 p-3 bg-red-100 border border-red-300 rounded-md">
            <p className="text-red-800 font-medium text-sm sm:text-base">{selectedHolidayName}</p>
          </div>
        )}
        
        <div className="flex justify-center mt-3">
          <Button
            variant="default"
            size="sm"
            onClick={goToToday}
            className="gap-2"
          >
            <CalendarIconLucide className="h-4 w-4" />
            اليوم
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-2 sm:px-6">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, index) => (
            <div key={index} className="p-1 text-center font-semibold text-muted-foreground text-xs sm:text-sm">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {emptyCells.map((_, index) => (
            <div key={`empty-${index}`} className="p-1 h-10 sm:h-12" />
          ))}
          
          {monthDays.map((day) => {
            const daySessions = getSessionsForDate(day);
            const dayAppointments = getAppointmentsForDate(day);
            const isToday = isDateToday(day);
            const isSelected = isSameDay(day, selectedDate);
            const isWeekendDay = isWeekend(day);
            const holidayName = getSyrianHoliday(day);
            const isHoliday = isSyrianHoliday(day);

            let dayClassName = `
              calendar-day relative p-1 sm:p-2 h-10 sm:h-12 text-center cursor-pointer border rounded-md transition-colors
              hover:bg-accent text-xs sm:text-sm
            `;

            if (isToday) {
              dayClassName += ' bg-legal-primary text-white';
            } else if (isHoliday) {
              dayClassName += ' bg-red-500 text-white';
            } else if (isWeekendDay) {
              dayClassName += ' bg-red-100 text-red-800';
            } else if (daySessions.length > 0) {
              dayClassName += ' bg-blue-100';
            } else if (dayAppointments.length > 0) {
              dayClassName += ' bg-green-100';
            }

            if (isSelected) {
              dayClassName += ' ring-2 ring-legal-secondary';
            }

            return (
              <div
                key={format(day, 'yyyy-MM-dd')}
                className={dayClassName}
                onClick={() => handleDateSelect(day)}
                title={holidayName || undefined}
              >
                <span className="font-medium">{day.getDate()}</span>
                
                {daySessions.length > 0 && (
                  <span className="session-badge absolute top-0 right-0 bg-blue-600 text-white text-xs rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center">
                    {daySessions.length}
                  </span>
                )}
                
                {dayAppointments.length > 0 && (
                  <span className="appointment-badge absolute bottom-0 right-0 bg-green-600 text-white text-xs rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center">
                    {dayAppointments.length}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 flex gap-2 sm:gap-4 text-xs sm:text-sm justify-center flex-wrap">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 rounded border"></div>
            <span>جلسات</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 rounded border"></div>
            <span>مواعيد</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 rounded border"></div>
            <span>عطلة أسبوعية</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded border"></div>
            <span>عطلة رسمية</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-legal-primary rounded border"></div>
            <span>اليوم</span>
          </div>
        </div>
        <div className="mt-3 text-center">
          <p className="text-sm sm:text-lg font-bold">{getFullSyrianDayName(selectedDate.getDay())} {selectedDate.getDate()} {getSyrianMonthName(selectedDate.getMonth())} {selectedDate.getFullYear()}</p>
        </div>
      </CardContent>
    </Card>
  );
};

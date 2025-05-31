
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIconLucide } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatSyrianDate, getSyrianMonthName, isDateToday, getFullSyrianDayName, isWeekend, getHolidayName, isHoliday } from '@/utils/dateUtils';
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
  };

  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  // Get holiday name for selected date
  const selectedDateHoliday = getHolidayName(selectedDate);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <CardTitle className="text-xl font-bold text-center">
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

        {/* Holiday name display */}
        {selectedDateHoliday && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md text-center">
            <span className="text-red-700 font-medium">{selectedDateHoliday}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, index) => (
            <div key={index} className="p-1 text-center font-semibold text-muted-foreground text-xs">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {emptyCells.map((_, index) => (
            <div key={`empty-${index}`} className="p-2 h-12" />
          ))}
          
          {monthDays.map((day) => {
            const daySessions = getSessionsForDate(day);
            const dayAppointments = getAppointmentsForDate(day);
            const isToday = isDateToday(day);
            const isSelected = isSameDay(day, selectedDate);
            const isWeekendDay = isWeekend(day);
            const isHolidayDay = isHoliday(day);

            return (
              <div
                key={format(day, 'yyyy-MM-dd')}
                className={`
                  calendar-day relative p-2 h-12 text-center cursor-pointer border rounded-md transition-colors
                  ${isToday ? 'bg-legal-primary text-white' : ''}
                  ${isSelected ? 'ring-2 ring-legal-secondary' : ''}
                  ${isHolidayDay ? 'bg-red-200 bg-opacity-50 text-red-700' : ''}
                  ${daySessions.length > 0 && !isHolidayDay ? 'bg-blue-100' : ''}
                  ${dayAppointments.length > 0 && !isHolidayDay ? 'bg-green-100' : ''}
                  hover:bg-accent
                `}
                onClick={() => onDateSelect(day)}
              >
                <span className={`text-sm font-medium ${isHolidayDay ? 'text-red-700' : ''}`}>
                  {day.getDate()}
                </span>
                
                {daySessions.length > 0 && (
                  <span className="session-badge absolute top-0 right-0 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {daySessions.length}
                  </span>
                )}
                
                {dayAppointments.length > 0 && (
                  <span className="appointment-badge absolute bottom-0 right-0 bg-green-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {dayAppointments.length}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 flex gap-4 text-sm justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 rounded border"></div>
            <span>جلسات</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded border"></div>
            <span>مواعيد</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-legal-primary rounded border"></div>
            <span>اليوم</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-200 bg-opacity-50 rounded border"></div>
            <span>عطلة</span>
          </div>
        </div>
        <div className="mt-2 text-center">
          <p className="text-lg font-bold">{getFullSyrianDayName(selectedDate.getDay())} {selectedDate.getDate()} {getSyrianMonthName(selectedDate.getMonth())} {selectedDate.getFullYear()}</p>
        </div>
      </CardContent>
    </Card>
  );
};

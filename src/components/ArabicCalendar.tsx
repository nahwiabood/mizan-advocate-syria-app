
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIconLucide } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatSyrianDate, getSyrianMonthName, isDateToday, getFullSyrianDayName } from '@/utils/dateUtils';
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

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 5 || day === 6; // Friday (5) and Saturday (6)
  };

  const isHoliday = (date: Date) => {
    // National and religious holidays in Syria
    const holidays = [
      // New Year's Day
      { month: 0, day: 1 },
      // Revolution Day
      { month: 2, day: 8 },
      // Mother's Day
      { month: 2, day: 21 },
      // Labor Day
      { month: 4, day: 1 },
      // Martyrs' Day
      { month: 4, day: 6 },
      // Independence Day
      { month: 3, day: 17 },
      // Christmas Day
      { month: 11, day: 25 },
    ];

    return holidays.some(holiday => 
      date.getMonth() === holiday.month && date.getDate() === holiday.day
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
                  ${isWeekendDay || isHolidayDay ? 'bg-red-100/50' : ''}
                  ${daySessions.length > 0 && !isWeekendDay && !isHolidayDay ? 'bg-blue-100' : ''}
                  ${dayAppointments.length > 0 && !isWeekendDay && !isHolidayDay ? 'bg-green-100' : ''}
                  hover:bg-accent
                `}
                onClick={() => onDateSelect(day)}
              >
                <span className={`text-sm font-medium ${isWeekendDay || isHolidayDay ? 'text-red-600' : ''}`}>
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
        
        <div className="mt-4 flex gap-4 text-sm justify-center flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 rounded border"></div>
            <span>جلسات</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded border"></div>
            <span>مواعيد</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100/50 rounded border"></div>
            <span>عطلة</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-legal-primary rounded border"></div>
            <span>اليوم</span>
          </div>
        </div>
        <div className="mt-2 text-center">
          <p className="text-lg font-bold">{getFullSyrianDayName(selectedDate.getDay())} {selectedDate.getDate()} {getSyrianMonthName(selectedDate.getMonth())} {selectedDate.getFullYear()}</p>
        </div>
      </CardContent>
    </Card>
  );
};

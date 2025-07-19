
import { format, parse, isToday, isBefore, startOfDay } from 'date-fns';

// Syrian date formatting utilities
export const formatSyrianDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy');
};

export const formatSyrianDateTime = (date: Date): string => {
  return format(date, 'dd/MM/yyyy HH:mm');
};

export const parseSyrianDate = (dateString: string): Date => {
  return parse(dateString, 'dd/MM/yyyy', new Date());
};

export const getSyrianMonthName = (month: number): string => {
  const months = [
    'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
    'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
  ];
  return months[month];
};

export const getSyrianDayName = (day: number): string => {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[day];
};

export const getFullSyrianDayName = (day: number): string => {
  return getSyrianDayName(day); // Already returns full names in Arabic
};

export const isDateToday = (date: Date): boolean => {
  return isToday(date);
};

export const isDatePast = (date: Date): boolean => {
  return isBefore(startOfDay(date), startOfDay(new Date()));
};

export const formatFullSyrianDate = (date: Date): string => {
  const dayName = getSyrianDayName(date.getDay());
  const day = date.getDate();
  const monthName = getSyrianMonthName(date.getMonth());
  const year = date.getFullYear();
  
  return `${dayName} ${day} ${monthName} ${year}`;
};

// Check if date is weekend (Friday or Saturday)
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday (5) and Saturday (6)
};

// Syrian holidays - fixed dates
const getSyrianHolidays = (year: number) => {
  return [
    { date: new Date(year, 0, 1), name: 'رأس السنة الميلادية' },
    { date: new Date(year, 2, 8), name: 'عيد المرأة العالمي' },
    { date: new Date(year, 2, 21), name: 'عيد الأم' },
    { date: new Date(year, 3, 17), name: 'عيد الجلاء' },
    { date: new Date(year, 4, 1), name: 'عيد العمال' },
    { date: new Date(year, 4, 6), name: 'عيد الشهداء' },
    { date: new Date(year, 11, 25), name: 'عيد الميلاد المجيد' }
  ];
};

// Check if date is a Syrian holiday
export const getSyrianHoliday = (date: Date): string | null => {
  const holidays = getSyrianHolidays(date.getFullYear());
  const holiday = holidays.find(h => 
    h.date.getDate() === date.getDate() && 
    h.date.getMonth() === date.getMonth()
  );
  return holiday ? holiday.name : null;
};

// Check if date is a holiday
export const isSyrianHoliday = (date: Date): boolean => {
  return getSyrianHoliday(date) !== null;
};

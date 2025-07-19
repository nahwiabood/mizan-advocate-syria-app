
import { format, parse, isToday, isBefore, startOfDay, isValid } from 'date-fns';

// Helper function to ensure we have a valid Date object
const ensureDate = (date: Date | string): Date => {
  if (typeof date === 'string') {
    const parsedDate = new Date(date);
    return isValid(parsedDate) ? parsedDate : new Date();
  }
  return isValid(date) ? date : new Date();
};

// Syrian date formatting utilities
export const formatSyrianDate = (date: Date | string): string => {
  const validDate = ensureDate(date);
  return format(validDate, 'dd/MM/yyyy');
};

export const formatSyrianDateTime = (date: Date | string): string => {
  const validDate = ensureDate(date);
  return format(validDate, 'dd/MM/yyyy HH:mm');
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

export const isDateToday = (date: Date | string): boolean => {
  const validDate = ensureDate(date);
  return isToday(validDate);
};

export const isDatePast = (date: Date | string): boolean => {
  const validDate = ensureDate(date);
  return isBefore(startOfDay(validDate), startOfDay(new Date()));
};

export const formatFullSyrianDate = (date: Date | string): string => {
  const validDate = ensureDate(date);
  const dayName = getSyrianDayName(validDate.getDay());
  const day = validDate.getDate();
  const monthName = getSyrianMonthName(validDate.getMonth());
  const year = validDate.getFullYear();
  
  return `${dayName} ${day} ${monthName} ${year}`;
};

// Check if date is weekend (Friday or Saturday)
export const isWeekend = (date: Date | string): boolean => {
  const validDate = ensureDate(date);
  const day = validDate.getDay();
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
export const getSyrianHoliday = (date: Date | string): string | null => {
  const validDate = ensureDate(date);
  const holidays = getSyrianHolidays(validDate.getFullYear());
  const holiday = holidays.find(h => 
    h.date.getDate() === validDate.getDate() && 
    h.date.getMonth() === validDate.getMonth()
  );
  return holiday ? holiday.name : null;
};

// Check if date is a holiday
export const isSyrianHoliday = (date: Date | string): boolean => {
  return getSyrianHoliday(date) !== null;
};

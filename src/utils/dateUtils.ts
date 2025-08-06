
import { format, parseISO, isValid, parse, isBefore, startOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';

export const formatSyrianDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, 'yyyy/MM/dd', { locale: ar });
};

export const formatFullSyrianDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, 'EEEE، dd MMMM yyyy', { locale: ar });
};

export const formatSyrianTime = (time: string) => {
  if (!time) return '';
  
  try {
    // Parse time string (HH:mm format)
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    
    return format(date, 'HH:mm');
  } catch (error) {
    return time;
  }
};

export const isDatePast = (date: Date): boolean => {
  return isBefore(startOfDay(date), startOfDay(new Date()));
};

export const parseSyrianDate = (dateStr: string): Date | null => {
  try {
    const parsed = parse(dateStr, 'yyyy/MM/dd', new Date());
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const getCurrentSyrianDate = (): string => {
  return formatSyrianDate(new Date());
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

// New functions needed by ArabicCalendar
export const getSyrianMonthName = (monthIndex: number): string => {
  const months = [
    'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
    'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
  ];
  return months[monthIndex] || '';
};

export const isDateToday = (date: Date): boolean => {
  const today = new Date();
  return isSameDay(date, today);
};

export const getFullSyrianDayName = (date: Date): string => {
  const days = [
    'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
  ];
  return days[date.getDay()] || '';
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday = 5, Saturday = 6
};

// Syrian national holidays
const syrianHolidays: { [key: string]: string } = {
  '01-01': 'رأس السنة الميلادية',
  '03-08': 'عيد الثورة',
  '03-21': 'عيد الأم',
  '04-17': 'عيد الجلاء',
  '05-01': 'عيد العمال',
  '05-06': 'عيد الشهداء',
  '10-06': 'حرب تشرين التحريرية',
  '12-25': 'عيد الميلاد المجيد'
};

export const getSyrianHoliday = (date: Date): string | null => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const key = `${month}-${day}`;
  return syrianHolidays[key] || null;
};

export const isSyrianHoliday = (date: Date): boolean => {
  return getSyrianHoliday(date) !== null;
};

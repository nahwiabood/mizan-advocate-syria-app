
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

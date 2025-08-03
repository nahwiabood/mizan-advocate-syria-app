
import { format, parseISO } from 'date-fns';
import { arSA } from 'date-fns/locale';

export const formatSyrianDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'تاريخ غير صحيح';
    }
    return format(dateObj, 'dd/MM/yyyy', { locale: arSA });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'تاريخ غير صحيح';
  }
};

export const formatFullSyrianDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'تاريخ غير صحيح';
    }
    return format(dateObj, 'EEEE، dd MMMM yyyy', { locale: arSA });
  } catch (error) {
    console.error('Error formatting full date:', error);
    return 'تاريخ غير صحيح';
  }
};

export const formatSyrianDateTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'تاريخ غير صحيح';
    }
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: arSA });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'تاريخ غير صحيح';
  }
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

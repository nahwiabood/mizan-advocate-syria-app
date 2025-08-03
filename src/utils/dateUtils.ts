
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

// إضافة الدوال المفقودة
export const getSyrianMonthName = (monthIndex: number): string => {
  const months = [
    'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
    'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
  ];
  return months[monthIndex] || '';
};

export const isDateToday = (date: Date): boolean => {
  return isToday(date);
};

export const getFullSyrianDayName = (dayIndex: number): string => {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[dayIndex] || '';
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 5 || day === 6; // الجمعة والسبت
};

export const getSyrianHoliday = (date: Date): string | null => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // عيد رأس السنة
  if (month === 1 && day === 1) return 'رأس السنة الميلادية';
  
  // عيد الاستقلال
  if (month === 4 && day === 17) return 'عيد الاستقلال';
  
  // عيد العمال
  if (month === 5 && day === 1) return 'عيد العمال';
  
  return null;
};

export const isSyrianHoliday = (date: Date): boolean => {
  return getSyrianHoliday(date) !== null;
};

export const isDatePast = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
};


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

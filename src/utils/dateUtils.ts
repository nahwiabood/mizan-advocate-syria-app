
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

// Syrian holidays and official days off
export const getSyrianHolidays = (year: number) => {
  const holidays = [
    // Fixed holidays
    { date: `${year}-01-01`, name: 'رأس السنة الميلادية' },
    { date: `${year}-03-08`, name: 'ثورة آذار' },
    { date: `${year}-03-21`, name: 'عيد الأم' },
    { date: `${year}-04-17`, name: 'عيد الجلاء' },
    { date: `${year}-05-01`, name: 'عيد العمال' },
    { date: `${year}-05-06`, name: 'عيد الشهداء' },
    { date: `${year}-10-06`, name: 'حرب تشرين التحريرية' },
    { date: `${year}-12-25`, name: 'عيد الميلاد المجيد' },
    
    // Religious holidays (approximate dates - these vary by lunar calendar)
    { date: `${year}-04-21`, name: 'عيد الفطر' },
    { date: `${year}-04-22`, name: 'عيد الفطر' },
    { date: `${year}-04-23`, name: 'عيد الفطر' },
    { date: `${year}-06-28`, name: 'عيد الأضحى' },
    { date: `${year}-06-29`, name: 'عيد الأضحى' },
    { date: `${year}-06-30`, name: 'عيد الأضحى' },
    { date: `${year}-07-01`, name: 'عيد الأضحى' },
    { date: `${year}-04-10`, name: 'المولد النبوي الشريف' },
  ];
  
  return holidays;
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday (5) and Saturday (6)
};

export const getHolidayName = (date: Date): string | null => {
  const year = date.getFullYear();
  const holidays = getSyrianHolidays(year);
  const dateString = format(date, 'yyyy-MM-dd');
  
  const holiday = holidays.find(h => h.date === dateString);
  return holiday ? holiday.name : null;
};

export const isHoliday = (date: Date): boolean => {
  return getHolidayName(date) !== null || isWeekend(date);
};

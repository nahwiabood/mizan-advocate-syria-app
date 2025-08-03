
import moment from 'moment';
import 'moment/locale/ar-sy';

moment.locale('ar-sy');

export const formatSyrianDate = (date: Date | string): string => {
  return moment(date).format('D MMMM YYYY');
};

export const formatFullSyrianDate = (date: Date | string): string => {
  return moment(date).format('dddd D MMMM YYYY');
};

export const formatSyrianDateTime = (date: Date | string): string => {
  return moment(date).format('dddd D MMMM YYYY - HH:mm');
};

export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  return moment(date1).isSame(date2, 'day');
};

export const isToday = (date: Date | string): boolean => {
  return moment(date).isSame(new Date(), 'day');
};

export const addDays = (date: Date | string, days: number): Date => {
  return moment(date).add(days, 'days').toDate();
};

export const formatSyrianTime = (time: string): string => {
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const hour12 = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    const ampm = hours >= 12 ? 'م' : 'ص';
    const minuteStr = minutes.toString().padStart(2, '0');
    return `${hour12}:${minuteStr} ${ampm}`;
  } catch (error) {
    return time;
  }
};

export const getSyrianMonthName = (month: number): string => {
  const monthNames = [
    'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
    'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
  ];
  return monthNames[month] || '';
};

export const isDateToday = (date: Date | string): boolean => {
  return moment(date).isSame(new Date(), 'day');
};

export const getFullSyrianDayName = (dayIndex: number): string => {
  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return dayNames[dayIndex] || '';
};

export const isWeekend = (date: Date | string): boolean => {
  const day = moment(date).day();
  return day === 5 || day === 6; // Friday or Saturday
};

export const getSyrianHoliday = (date: Date | string): string | null => {
  const momentDate = moment(date);
  const month = momentDate.month() + 1; // moment months are 0-indexed
  const day = momentDate.date();
  
  // Syrian national holidays
  const holidays: Record<string, string> = {
    '1-1': 'رأس السنة الميلادية',
    '3-8': 'عيد الثورة',
    '3-21': 'عيد الأم',
    '4-17': 'عيد الجلاء',
    '5-1': 'عيد العمال',
    '5-6': 'عيد الشهداء',
    '10-6': 'عيد تشرين التحريري',
    '12-25': 'عيد الميلاد المجيد'
  };
  
  return holidays[`${month}-${day}`] || null;
};

export const isSyrianHoliday = (date: Date | string): boolean => {
  return getSyrianHoliday(date) !== null;
};

export const isDatePast = (date: Date | string): boolean => {
  return moment(date).isBefore(new Date(), 'day');
};

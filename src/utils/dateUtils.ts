
import { format, isToday, isWeekend as isWeekendFns, parse, isValid } from 'date-fns';

const syrianDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const syrianMonths = [
  'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
  'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
];

export const formatSyrianDate = (date: Date): string => {
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return `${day} ${syrianMonths[monthIndex]} ${year}`;
};

export const formatFullSyrianDate = (date: Date): string => {
  const dayName = syrianDays[date.getDay()];
  return `${dayName}، ${formatSyrianDate(date)}`;
};

export const formatISODate = (dateString: string): string => {
  try {
    const date = parse(dateString, 'yyyy-MM-dd', new Date());
    return formatSyrianDate(date);
  } catch (error) {
    console.error("Error parsing date:", error);
    return 'Invalid Date';
  }
};

export const getSyrianMonthName = (monthIndex: number): string => {
  return syrianMonths[monthIndex];
};

export const getFullSyrianDayName = (date: Date): string => {
  return syrianDays[date.getDay()];
};

export const isDateToday = (date: Date): boolean => {
  return isToday(date);
};

export const isWeekend = (date: Date): boolean => {
  // In Syria, Friday and Saturday are weekend days
  const day = date.getDay();
  return day === 5 || day === 6; // Friday = 5, Saturday = 6
};

export const isDatePast = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
};

// Syrian national holidays
export const getSyrianHoliday = (date: Date): string | null => {
  const day = date.getDate();
  const month = date.getMonth();

  // Fixed date holidays
  if (month === 0 && day === 1) return 'رأس السنة الميلادية';
  if (month === 2 && day === 8) return 'عيد الثورة';
  if (month === 2 && day === 21) return 'عيد الأم';
  if (month === 3 && day === 17) return 'عيد الجلاء';
  if (month === 4 && day === 1) return 'عيد العمال';
  if (month === 4 && day === 6) return 'عيد الشهداء';
  if (month === 7 && day === 1) return 'عيد الجيش';
  if (month === 10 && day === 16) return 'عيد التصحيح';
  if (month === 11 && day === 25) return 'عيد الميلاد المجيد';

  return null;
};

export const isSyrianHoliday = (date: Date): boolean => {
  return getSyrianHoliday(date) !== null;
};

export const isHolidayOrWeekend = (date: Date): boolean => {
  return isWeekend(date) || isSyrianHoliday(date);
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const formatSyrianTime = (time: string | Date): string => {
  if (!time) return '';
  
  try {
    let timeString: string;
    
    if (time instanceof Date) {
      timeString = time.toTimeString().slice(0, 5);
    } else {
      timeString = time;
    }
    
    // Convert from HH:MM format to Arabic format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    
    if (hour === 12) {
      return `${hour}:${minutes.padStart(2, '0')} ظهراً`;
    } else if (hour > 12) {
      return `${hour - 12}:${minutes.padStart(2, '0')} مساءً`;
    } else if (hour === 0) {
      return `12:${minutes.padStart(2, '0')} صباحاً`;
    } else {
      return `${hour}:${minutes.padStart(2, '0')} صباحاً`;
    }
  } catch (error) {
    return time.toString();
  }
};

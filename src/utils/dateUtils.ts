
// Arabic date utilities without moment.js dependency

const ARABIC_MONTHS = [
  'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
  'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
];

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const parseDate = (date: Date | string): Date => {
  return typeof date === 'string' ? new Date(date) : date;
};

export const formatSyrianDate = (date: Date | string): string => {
  const d = parseDate(date);
  const day = d.getDate();
  const month = ARABIC_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

export const formatFullSyrianDate = (date: Date | string): string => {
  const d = parseDate(date);
  const dayName = ARABIC_DAYS[d.getDay()];
  const day = d.getDate();
  const month = ARABIC_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName} ${day} ${month} ${year}`;
};

export const formatSyrianDateTime = (date: Date | string): string => {
  const d = parseDate(date);
  const dayName = ARABIC_DAYS[d.getDay()];
  const day = d.getDate();
  const month = ARABIC_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${dayName} ${day} ${month} ${year} - ${hours}:${minutes}`;
};

export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

export const isToday = (date: Date | string): boolean => {
  return isSameDay(date, new Date());
};

export const addDays = (date: Date | string, days: number): Date => {
  const d = new Date(parseDate(date));
  d.setDate(d.getDate() + days);
  return d;
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
  return ARABIC_MONTHS[month] || '';
};

export const isDateToday = (date: Date | string): boolean => {
  return isToday(date);
};

export const getFullSyrianDayName = (dayIndex: number): string => {
  return ARABIC_DAYS[dayIndex] || '';
};

export const isWeekend = (date: Date | string): boolean => {
  const day = parseDate(date).getDay();
  return day === 5 || day === 6; // Friday or Saturday
};

export const getSyrianHoliday = (date: Date | string): string | null => {
  const d = parseDate(date);
  const month = d.getMonth() + 1; // JavaScript months are 0-indexed
  const day = d.getDate();
  
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
  const d = parseDate(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < today;
};

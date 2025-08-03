import moment from 'moment';
import 'moment/locale/ar-sy';

moment.locale('ar-sy');

export const formatSyrianDate = (date: Date): string => {
  return moment(date).format('D MMMM YYYY');
};

export const formatFullSyrianDate = (date: Date): string => {
  return moment(date).format('dddd D MMMM YYYY');
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return moment(date1).isSame(date2, 'day');
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

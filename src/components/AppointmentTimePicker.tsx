
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AppointmentTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const AppointmentTimePicker: React.FC<AppointmentTimePickerProps> = ({
  value,
  onChange,
  placeholder = "اختر الوقت"
}) => {
  // Generate time options from 7:00 AM to 11:00 PM
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 7; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? 'م' : 'ص';
        const minuteStr = minute === 0 ? '00' : minute.toString();
        const time12 = `${hour12}:${minuteStr} ${ampm}`;
        times.push({ value: time24, label: time12 });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="text-right" dir="rtl">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-60 overflow-y-auto">
        {timeOptions.map((time) => (
          <SelectItem key={time.value} value={time.value} className="text-right">
            {time.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

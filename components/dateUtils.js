import { format, addDays, startOfWeek } from 'date-fns';

export const generateWeekDays = (startDate) => {
  return Array.from({ length: 7 }, (_, index) => addDays(startDate, index));
};

export const getFormattedWeekDays = (startDate) => {
  const weekDays = generateWeekDays(startDate);
  return weekDays.map(date => ({
    dayName: format(date, 'EEEE'),
    date: format(date, 'yyyy-MM-dd'),
    formattedDate: format(date, 'dd-MM-yyyy'),
  }));
};

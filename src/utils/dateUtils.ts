import { format } from 'date-fns';

/**
 * Safely formats a date string or Date object.
 * Returns a fallback string if the date is invalid.
 */
export const safeFormat = (date: any, formatStr: string, fallback: string = '...'): string => {
  if (!date) return fallback;
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return fallback;
    }
    return format(d, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
};

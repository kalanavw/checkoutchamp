
import { format, isValid, parseISO } from "date-fns";

/**
 * Safely formats a date value to a string using the specified format.
 * Handles various date formats and invalid dates gracefully.
 */
export const formatSafeDate = (date: Date | string | number | null | undefined, formatStr: string): string => {
  if (!date) return "N/A";
  
  try {
    // If it's already a Date object and valid
    if (date instanceof Date && isValid(date)) {
      return format(date, formatStr);
    }
    
    // If it's a string/number, try to parse it
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
    
    if (isValid(parsedDate)) {
      return format(parsedDate, formatStr);
    }
    
    return "Invalid date";
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Error";
  }
};

/**
 * Date utility functions for consistent date handling across the application
 */

/**
 * Safely creates a Date object from various input formats
 * @param dateValue - The date value to parse
 * @returns A valid Date object or current date as fallback
 */
export const createSafeDate = (dateValue?: string | Date | null): Date => {
  if (!dateValue) return new Date();

  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? new Date() : dateValue;
  }

  // Handle string values
  if (typeof dateValue === 'string') {
    // Remove any invalid characters that might cause "Inval" error
    const cleanValue = dateValue.trim();
    if (!cleanValue || cleanValue === 'Invalid Date' || cleanValue === 'Inval') {
      console.warn('Invalid date string detected:', dateValue);
      return new Date();
    }

    const date = new Date(cleanValue);
    if (isNaN(date.getTime())) {
      console.warn('Failed to parse date:', dateValue);
      return new Date();
    }

    return date;
  }

  return new Date();
};

/**
 * Normalizes date format for datetime-local inputs
 * @param value - Date string value
 * @returns Normalized datetime-local format (YYYY-MM-DDTHH:MM)
 */
export const normalizeDateTimeLocal = (value?: string): string => {
  if (!value) return '';

  try {
    const date = createSafeDate(value);

    // Convert to datetime-local format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.warn('Error normalizing date:', value, error);
    return '';
  }
};

/**
 * Validates if a date string is in valid format
 * @param dateValue - Date string to validate
 * @returns true if valid, false otherwise
 */
export const isValidDateString = (dateValue: string): boolean => {
  if (!dateValue || dateValue.trim() === '') return false;

  const date = new Date(dateValue);
  return !isNaN(date.getTime());
};

/**
 * Formats date for display
 * @param dateValue - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export const formatDisplayDate = (
  dateValue: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string => {
  try {
    const date = createSafeDate(dateValue);
    return date.toLocaleDateString('ja-JP', options);
  } catch (error) {
    console.warn('Error formatting date:', dateValue, error);
    return '無効な日付';
  }
};

/**
 * Gets today's date in YYYY-MM-DD format for min attribute
 * @returns Today's date string
 */
export const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Gets current datetime in datetime-local format for min attribute
 * @returns Current datetime string
 */
export const getCurrentDateTimeString = (): string => {
  const now = new Date();
  return normalizeDateTimeLocal(now.toISOString());
};

/**
 * Formats date and time for display in Japanese locale
 * @param dateValue - Date to format
 * @returns Formatted date and time string
 */
export const formatDateAndTime = (dateValue: string | Date): string => {
  try {
    const date = createSafeDate(dateValue);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.warn('Error formatting date and time:', dateValue, error);
    return '無効な日時';
  }
};

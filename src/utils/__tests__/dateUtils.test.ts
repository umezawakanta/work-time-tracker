import {
  formatDateAndTime,
  formatTime,
  calculateDuration,
  minutesToHoursAndMinutes,
  parseDateTime,
  formatDate,
  calculateDaysBetween,
  addDays,
  formatDuration,
  convertNumericToDateString,
  getYearMonth,
  formatBillingDate,
  convertDateStringToNumber,
  isValidDateFormat,
  isValidBillingDate,
  formatDisplayDate,
} from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDateAndTime', () => {
    const testDate = new Date(2024, 0, 15, 14, 30, 0); // 2024-01-15 14:30:00

    it('should format Date object with Japanese locale', () => {
      const result = formatDateAndTime(testDate, 'ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      expect(result).toContain('2024');
      expect(result).toContain('1月');
      expect(result).toContain('15');
      expect(result).toContain('14');
      expect(result).toContain('30');
    });

    it('should format Date object with English locale', () => {
      const result = formatDateAndTime(testDate, 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      expect(result).toContain('2024');
      expect(result).toContain('January');
      expect(result).toContain('15');
    });

    it('should format ISO string date', () => {
      const isoString = testDate.toISOString();
      const result = formatDateAndTime(isoString, 'ja-JP', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
      expect(result).toContain('2024');
    });

    it('should use default options when none provided', () => {
      const result = formatDateAndTime(testDate, 'ja-JP');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatTime', () => {
    it('should format time in HH:MM format for Japanese locale', () => {
      const date = new Date(2024, 0, 15, 9, 5, 0);
      const result = formatTime(date, 'ja-JP');
      expect(result).toBe('09:05');
    });

    it('should format time in HH:MM format for US locale', () => {
      const date = new Date(2024, 0, 15, 14, 30, 0);
      const result = formatTime(date, 'en-US');
      expect(result).toBe('14:30');
    });

    it('should handle midnight correctly', () => {
      const date = new Date(2024, 0, 15, 0, 0, 0);
      const result = formatTime(date, 'ja-JP');
      expect(result).toBe('00:00');
    });

    it('should handle noon correctly', () => {
      const date = new Date(2024, 0, 15, 12, 0, 0);
      const result = formatTime(date, 'ja-JP');
      expect(result).toBe('12:00');
    });
  });

  describe('calculateDuration', () => {
    it('should calculate duration in minutes correctly', () => {
      const start = new Date(2024, 0, 15, 9, 0, 0);
      const end = new Date(2024, 0, 15, 10, 30, 0);
      const result = calculateDuration(start, end);
      expect(result).toBe(90);
    });

    it('should handle same start and end time', () => {
      const date = new Date(2024, 0, 15, 9, 0, 0);
      const result = calculateDuration(date, date);
      expect(result).toBe(0);
    });

    it('should handle negative duration (end before start)', () => {
      const start = new Date(2024, 0, 15, 10, 0, 0);
      const end = new Date(2024, 0, 15, 9, 0, 0);
      const result = calculateDuration(start, end);
      expect(result).toBe(-60);
    });

    it('should round fractional minutes correctly', () => {
      const start = new Date(2024, 0, 15, 9, 0, 0);
      const end = new Date(2024, 0, 15, 9, 0, 30); // 30 seconds
      const result = calculateDuration(start, end);
      expect(result).toBe(1);
    });
  });

  describe('minutesToHoursAndMinutes', () => {
    it('should convert minutes to hours and minutes', () => {
      const result = minutesToHoursAndMinutes(150);
      expect(result).toEqual({ hours: 2, minutes: 30 });
    });

    it('should handle exact hours', () => {
      const result = minutesToHoursAndMinutes(120);
      expect(result).toEqual({ hours: 2, minutes: 0 });
    });

    it('should handle less than an hour', () => {
      const result = minutesToHoursAndMinutes(45);
      expect(result).toEqual({ hours: 0, minutes: 45 });
    });

    it('should handle zero minutes', () => {
      const result = minutesToHoursAndMinutes(0);
      expect(result).toEqual({ hours: 0, minutes: 0 });
    });

    it('should handle large numbers', () => {
      const result = minutesToHoursAndMinutes(1440); // 24 hours
      expect(result).toEqual({ hours: 24, minutes: 0 });
    });
  });

  describe('parseDateTime', () => {
    it('should parse date and time strings correctly', () => {
      const result = parseDateTime('2024-01-15', '14:30');
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0); // January is 0
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
    });

    it('should handle single digit values', () => {
      const result = parseDateTime('2024-01-05', '09:05');
      expect(result.getDate()).toBe(5);
      expect(result.getHours()).toBe(9);
      expect(result.getMinutes()).toBe(5);
    });

    it('should handle midnight', () => {
      const result = parseDateTime('2024-01-15', '00:00');
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });
  });

  describe('formatDate', () => {
    const testDate = new Date(2024, 0, 15);

    it('should format date with Japanese locale', () => {
      const result = formatDate(testDate, 'ja-JP');
      expect(result).toContain('2024');
      expect(result).toContain('1月');
      expect(result).toContain('15');
    });

    it('should format date with English locale', () => {
      const result = formatDate(testDate, 'en-US');
      expect(result).toContain('2024');
      expect(result).toContain('January');
      expect(result).toContain('15');
    });
  });

  describe('calculateDaysBetween', () => {
    it('should calculate days between two dates', () => {
      const start = new Date(2024, 0, 10);
      const end = new Date(2024, 0, 15);
      const result = calculateDaysBetween(start, end);
      expect(result).toBe(5);
    });

    it('should handle reversed date order', () => {
      const start = new Date(2024, 0, 15);
      const end = new Date(2024, 0, 10);
      const result = calculateDaysBetween(start, end);
      expect(result).toBe(5);
    });

    it('should handle same date', () => {
      const date = new Date(2024, 0, 15);
      const result = calculateDaysBetween(date, date);
      expect(result).toBe(0);
    });

    it('should handle dates across months', () => {
      const start = new Date(2024, 0, 31); // January 31
      const end = new Date(2024, 1, 2); // February 2
      const result = calculateDaysBetween(start, end);
      expect(result).toBe(2);
    });
  });

  describe('addDays', () => {
    it('should add positive days', () => {
      const date = new Date(2024, 0, 15);
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(20);
      expect(result.getMonth()).toBe(0);
    });

    it('should add negative days', () => {
      const date = new Date(2024, 0, 15);
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(10);
      expect(result.getMonth()).toBe(0);
    });

    it('should handle month boundary', () => {
      const date = new Date(2024, 0, 30);
      const result = addDays(date, 5);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(4);
    });

    it('should not modify original date', () => {
      const originalDate = new Date(2024, 0, 15);
      const originalTime = originalDate.getTime();
      addDays(originalDate, 5);
      expect(originalDate.getTime()).toBe(originalTime);
    });
  });

  describe('formatDuration', () => {
    it('should format hours, minutes, and seconds', () => {
      const result = formatDuration(3665); // 1 hour, 1 minute, 5 seconds
      expect(result).toBe('1時間 1分 5秒');
    });

    it('should format only seconds', () => {
      const result = formatDuration(30);
      expect(result).toBe('30秒');
    });

    it('should format only minutes and seconds', () => {
      const result = formatDuration(125); // 2 minutes, 5 seconds
      expect(result).toBe('2分 5秒');
    });

    it('should format only hours', () => {
      const result = formatDuration(3600); // 1 hour
      expect(result).toBe('1時間');
    });

    it('should handle zero duration', () => {
      const result = formatDuration(0);
      expect(result).toBe('0秒');
    });

    it('should handle large durations', () => {
      const result = formatDuration(86400); // 24 hours
      expect(result).toBe('24時間');
    });
  });

  describe('convertNumericToDateString', () => {
    it('should convert 8-digit numeric date to YYYY/MM/DD format', () => {
      const result = convertNumericToDateString(20240115);
      expect(result).toBe('2024/01/15');
    });

    it('should handle non-8-digit numbers', () => {
      const result = convertNumericToDateString(123);
      expect(result).toBe('123');
    });

    it('should handle edge case dates', () => {
      const result = convertNumericToDateString(20241231);
      expect(result).toBe('2024/12/31');
    });
  });

  describe('getYearMonth', () => {
    it('should extract year and month from 8-digit date', () => {
      const result = getYearMonth(20240115);
      expect(result).toBe('2024/01');
    });

    it('should handle non-8-digit numbers', () => {
      const result = getYearMonth(123);
      expect(result).toBe('');
    });

    it('should handle December correctly', () => {
      const result = getYearMonth(20241231);
      expect(result).toBe('2024/12');
    });
  });

  describe('formatBillingDate', () => {
    it('should format numeric YYYYMMDD date', () => {
      const result = formatBillingDate(20240115);
      expect(result).toBe('2024/01/15');
    });

    it('should format string YYYYMMDD date', () => {
      const result = formatBillingDate('20240115');
      expect(result).toBe('2024/01/15');
    });

    it('should return string with slashes as-is', () => {
      const result = formatBillingDate('2024/01/15');
      expect(result).toBe('2024/01/15');
    });

    it('should handle null and undefined', () => {
      expect(formatBillingDate(null)).toBe('');
      expect(formatBillingDate(undefined)).toBe('');
    });

    it('should handle other formats', () => {
      const result = formatBillingDate('abc123');
      expect(result).toBe('abc123');
    });
  });

  describe('convertDateStringToNumber', () => {
    it('should convert YYYY/MM/DD to numeric format', () => {
      const result = convertDateStringToNumber('2024/01/15');
      expect(result).toBe(20240115);
    });

    it('should convert YYYY-MM-DD to numeric format', () => {
      const result = convertDateStringToNumber('2024-01-15');
      expect(result).toBe(20240115);
    });

    it('should handle mixed separators', () => {
      const result = convertDateStringToNumber('2024/01-15');
      expect(result).toBe(20240115);
    });
  });

  describe('isValidDateFormat', () => {
    it('should validate correct YYYY/MM/DD format', () => {
      expect(isValidDateFormat('2024/01/15')).toBe(true);
      expect(isValidDateFormat('2024/12/31')).toBe(true);
    });

    it('should reject incorrect formats', () => {
      expect(isValidDateFormat('2024-01-15')).toBe(false);
      expect(isValidDateFormat('24/01/15')).toBe(false);
      expect(isValidDateFormat('2024/1/15')).toBe(false);
      expect(isValidDateFormat('2024/01/5')).toBe(false);
      expect(isValidDateFormat('invalid')).toBe(false);
    });
  });

  describe('isValidBillingDate', () => {
    it('should validate 8-digit numeric dates', () => {
      expect(isValidBillingDate(20240115)).toBe(true);
      expect(isValidBillingDate(20241231)).toBe(true);
    });

    it('should validate YYYY/MM/DD string format', () => {
      expect(isValidBillingDate('2024/01/15')).toBe(true);
      expect(isValidBillingDate('2024/12/31')).toBe(true);
    });

    it('should reject invalid numeric dates', () => {
      expect(isValidBillingDate(123)).toBe(false);
      expect(isValidBillingDate(123456789)).toBe(false);
    });

    it('should reject invalid string formats', () => {
      expect(isValidBillingDate('2024-01-15')).toBe(false);
      expect(isValidBillingDate('invalid')).toBe(false);
    });
  });

  describe('formatDisplayDate', () => {
    it('should return YYYY/MM/DD format as-is', () => {
      const result = formatDisplayDate('2024/01/15');
      expect(result).toBe('2024/01/15');
    });

    it('should convert 8-digit numeric string to YYYY/MM/DD', () => {
      const result = formatDisplayDate('20240115');
      expect(result).toBe('2024/01/15');
    });

    it('should convert YYYY-MM-DD to YYYY/MM/DD', () => {
      const result = formatDisplayDate('2024-01-15');
      expect(result).toBe('2024/01/15');
    });

    it('should return other formats as-is', () => {
      const result = formatDisplayDate('invalid date');
      expect(result).toBe('invalid date');
    });
  });
});

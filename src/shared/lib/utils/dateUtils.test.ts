import { describe, it, expect } from 'vitest';
import { parseDateToComparableNumber, isDateNewer, formatToDisplayDate } from './dateUtils';

describe('dateUtils', () => {
  describe('parseDateToComparableNumber', () => {
    it('should parse ISO date YYYY-MM-DD', () => {
      expect(parseDateToComparableNumber('2024-05-20')).toBe(20240520);
    });

    it('should parse ADM date DD/MM/YYYY', () => {
      expect(parseDateToComparableNumber('20/05/2024')).toBe(20240520);
    });

    it('should return 0 for invalid formats', () => {
      expect(parseDateToComparableNumber('invalid')).toBe(0);
      expect(parseDateToComparableNumber('')).toBe(0);
    });
  });

  describe('isDateNewer', () => {
    it('should identify newer date', () => {
      expect(isDateNewer('2024-05-21', '2024-05-20')).toBe(true);
      expect(isDateNewer('20/05/2024', '19/05/2024')).toBe(true);
      expect(isDateNewer('20/05/2024', '2024-05-20')).toBe(false); // same date
    });
  });

  describe('formatToDisplayDate', () => {
    it('should convert ISO to display date', () => {
      expect(formatToDisplayDate('2024-05-20')).toBe('20/05/2024');
      expect(formatToDisplayDate('2024-05-20T10:00:00Z')).toBe('20/05/2024');
    });

    it('should keep ADM format', () => {
      expect(formatToDisplayDate('20/05/2024')).toBe('20/05/2024');
    });

    it('should return N/D for undefined or empty', () => {
      expect(formatToDisplayDate(undefined)).toBe('N/D');
      expect(formatToDisplayDate('')).toBe('N/D');
    });
  });
});

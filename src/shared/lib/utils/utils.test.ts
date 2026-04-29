import { describe, it, expect } from 'vitest';
import { escapeRegExp, createWordStartRegex, SYNONYM_MAP } from './utils';

describe('Utility Functions', () => {
  describe('escapeRegExp', () => {
    it('should escape special regex characters', () => {
      expect(escapeRegExp('test.com')).toBe('test\\.com');
      expect(escapeRegExp('plus+')).toBe('plus\\+');
      expect(escapeRegExp('(bracket)')).toBe('\\(bracket\\)');
    });
  });

  describe('createWordStartRegex', () => {
    it('should create a regex that matches the start of a word', () => {
      const regex = createWordStartRegex('marl');
      expect(regex.test('Marlboro')).toBe(true);
      expect(regex.test('New Marlboro')).toBe(true);
      expect(regex.test('Some Marl')).toBe(true);
      expect(regex.test('Amarlboro')).toBe(false);
    });

    it('should be case insensitive', () => {
      const regex = createWordStartRegex('MARL');
      expect(regex.test('marlboro')).toBe(true);
    });
  });

  describe('SYNONYM_MAP', () => {
    it('should contain basic Italian dictionary mappings', () => {
      expect(SYNONYM_MAP['sigaretta']).toContain('sigarette');
      expect(SYNONYM_MAP['tabacco']).toContain('tabacchi');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { formatHistoryEntry } from './syncHistoryUtils';

describe('syncHistoryUtils', () => {
  describe('formatHistoryEntry', () => {
    it('should return undefined if there are no variations', () => {
      const stats = { new: 0, price: 0, status: 0, emissions: 0 };
      const variations: string[] = [];
      const result = formatHistoryEntry('2026-05-12', stats, variations);
      expect(result).toBeUndefined();
    });

    it('should format a valid history entry', () => {
      const stats = { new: 1, price: 2, status: 0, emissions: 0 };
      const variations = ['New Product', 'Price changed', 'Price changed 2'];
      const result = formatHistoryEntry('2026-05-12', stats, variations);
      
      expect(result).toBeDefined();
      expect(result?.title).toContain('ADM Price List Update (2026-05-12)');
      expect(result?.date).toBe('2026-05-12');
      expect(result?.stats).toEqual(stats);
      expect(result?.variations).toHaveLength(3);
    });

    it('should use default text if date is missing', () => {
      const stats = { new: 1, price: 0, status: 0, emissions: 0 };
      const variations = ['Something changed'];
      const result = formatHistoryEntry('', stats, variations);
      
      expect(result?.date).toContain('recent');
    });
  });
});

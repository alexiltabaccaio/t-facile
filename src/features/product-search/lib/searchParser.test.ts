import { describe, it, expect } from 'vitest';
import { parseSearchQuery } from './searchParser';

describe('parseSearchQuery', () => {
  it('should handle simple text search', () => {
    const result = parseSearchQuery('marlboro gold', 'name');
    expect(result.searchKeywords).toEqual(['marlboro', 'gold']);
    expect(result.isRetiredSearch).toBe(false);
    expect(result.emissionFilters).toHaveLength(0);
  });

  it('should detect retired magic words', () => {
    const result = parseSearchQuery('marlboro radiato', 'name');
    expect(result.searchKeywords).toEqual(['marlboro']);
    expect(result.isRetiredSearch).toBe(true);
  });

  it('should handle partial retired magic words', () => {
    const result = parseSearchQuery('marlboro radia', 'name');
    expect(result.searchKeywords).toEqual(['marlboro']);
    expect(result.isRetiredSearch).toBe(true);
  });

  it('should ignore emission filters when not in emission sort mode', () => {
    const result = parseSearchQuery('nic<0.5 marlboro', 'name');
    expect(result.searchKeywords).toEqual(['nic<0.5', 'marlboro']);
    expect(result.emissionFilters).toHaveLength(0);
  });

  describe('Emission filters (in nicotine sort)', () => {
    it('should parse nicotine filter with operator', () => {
      const result = parseSearchQuery('nic<0.5', 'nicotine');
      expect(result.emissionFilters).toEqual([
        { key: 'nicotine', operator: '<', value: 0.5 }
      ]);
      expect(result.searchKeywords).toEqual([]);
    });

    it('should parse multiple emission filters', () => {
      const result = parseSearchQuery('nic>0.5 cat=10 co<5', 'nicotine');
      expect(result.emissionFilters).toEqual([
        { key: 'nicotine', operator: '>', value: 0.5 },
        { key: 'tar', operator: '=', value: 10 },
        { key: 'co', operator: '<', value: 5 }
      ]);
    });

    it('should handle comma as decimal separator', () => {
      const result = parseSearchQuery('nic<0,7', 'nicotine');
      expect(result.emissionFilters).toEqual([
        { key: 'nicotine', operator: '<', value: 0.7 }
      ]);
    });

    it('should handle aliases like "nicotina" or "catrame"', () => {
      const result = parseSearchQuery('nicotina>0.3 catrame<8', 'nicotine');
      expect(result.emissionFilters).toEqual([
        { key: 'nicotine', operator: '>', value: 0.3 },
        { key: 'tar', operator: '<', value: 8 }
      ]);
    });

    it('should mix text keywords and emission filters', () => {
      const result = parseSearchQuery('camel blue nic<0.6', 'nicotine');
      expect(result.searchKeywords).toEqual(['camel', 'blue']);
      expect(result.emissionFilters).toEqual([
        { key: 'nicotine', operator: '<', value: 0.6 }
      ]);
    });

    it('should ignore keywords that are just prefixes of emission names', () => {
      // In the implementation, if it starts with or is a prefix of emission keyword, it's skipped if not matched by regex
      const result = parseSearchQuery('nic marlboro', 'nicotine');
      expect(result.searchKeywords).toEqual(['marlboro']);
      expect(result.emissionFilters).toEqual([]);
    });
  });

  it('should handle empty or whitespace query', () => {
    const result = parseSearchQuery('   ', 'name');
    expect(result.searchKeywords).toEqual([]);
    expect(result.isRetiredSearch).toBe(false);
  });
});

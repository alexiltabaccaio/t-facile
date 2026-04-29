import { describe, it, expect } from 'vitest';
import { splitTextInChunks } from './textChunker';

describe('textChunker', () => {
  describe('splitTextInChunks', () => {
    it('should split by page markers', () => {
      const text = `
--- PAGE 1 ---
Content of page 1
--- PAGE 2 ---
Content of page 2
--- PAGE 3 ---
Content of page 3
--- PAGE 4 ---
Content of page 4
`;
      // Default is 3 pages per chunk
      const chunks = splitTextInChunks(text, 2);
      expect(chunks).toHaveLength(2);
      expect(chunks[0]).toContain('Content of page 1');
      expect(chunks[0]).toContain('Content of page 2');
      expect(chunks[1]).toContain('Content of page 3');
      expect(chunks[1]).toContain('Content of page 4');
    });

    it('should use character-based fallback for long text without markers', () => {
      // Create a string longer than 6000 characters
      const longText = 'A'.repeat(12000);
      const chunks = splitTextInChunks(longText);
      // chunkSize is 5000, so 12000 / 5000 = 3 chunks
      expect(chunks.length).toBe(3);
    });

    it('should return single chunk for short text without markers', () => {
      const shortText = 'Short text';
      const chunks = splitTextInChunks(shortText);
      expect(chunks).toEqual(['Short text']);
    });

    it('should return empty array for empty or whitespace text', () => {
      expect(splitTextInChunks('')).toEqual([]);
      expect(splitTextInChunks('   ')).toEqual([]);
    });

    it('should handle different capitalization and spacing in markers', () => {
      const text = `--- page 1 ---
Page 1
---  PAGE  2  ---
Page 2`;
      const chunks = splitTextInChunks(text, 1);
      expect(chunks).toHaveLength(2);
      expect(chunks[0]).toContain('Page 1');
      expect(chunks[1]).toContain('Page 2');
    });
  });
});

import { describe, it, expect, vi, Mock } from 'vitest';
import { extractTextFromPDF } from './pdfExtractor';
import * as pdfjs from 'pdfjs-dist';

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {
    workerSrc: ''
  },
  getDocument: vi.fn()
}));

describe('pdfExtractor', () => {
  it('should insert newlines and pipe separators', async () => {
    // Mock PDF page content
    const mockItems = [
      { str: 'Line 1', transform: [0, 0, 0, 0, 0, 100] },
      { str: 'Item 1.2', transform: [0, 0, 0, 0, 50, 100] },
      { str: 'Line 2', transform: [0, 0, 0, 0, 0, 90] }, // Y change > 4
      { str: 'Line 3', transform: [0, 0, 0, 0, 0, 80] }, // Y change > 4
    ];

    const mockPage = {
      getTextContent: vi.fn().mockResolvedValue({ items: mockItems })
    };

    const mockPdf = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue(mockPage)
    };

    (pdfjs.getDocument as Mock).mockReturnValue({
      promise: Promise.resolve(mockPdf)
    });

    const mockFile = {
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0))
    } as unknown as File;

    const result = await extractTextFromPDF(mockFile);

    // Expected format:
    // --- PAGE 1 ---
    // Line 1 | Item 1.2
    // Line 2
    // Line 3
    expect(result).toContain('Line 1 | Item 1.2\\nLine 2\\nLine 3');
  });

  it('should handle special characters and infinity symbol', async () => {
    const mockItems = [
      { str: 'Value ∞', transform: [0, 0, 0, 0, 0, 100] }
    ];

    const mockPage = {
      getTextContent: vi.fn().mockResolvedValue({ items: mockItems })
    };

    const mockPdf = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue(mockPage)
    };

    (pdfjs.getDocument as Mock).mockReturnValue({
      promise: Promise.resolve(mockPdf)
    });

    const mockFile = {
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0))
    } as unknown as File;

    const result = await extractTextFromPDF(mockFile);
    expect(result).toContain('Value °');
  });
});

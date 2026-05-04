import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzePdfChunks } from './pdfAnalyzer';
import { extractTextFromPDF } from './pdfExtractor';
import { analyzeTextWithAI } from './aiService';

vi.mock('./pdfExtractor', () => ({
  extractTextFromPDF: vi.fn(),
}));

vi.mock('./aiService', () => ({
  analyzeTextWithAI: vi.fn(),
}));

describe('pdfAnalyzer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process PDF and merge products', async () => {
    const mockFile = new File([''], 'test.pdf', { type: 'application/pdf' });
    (extractTextFromPDF as any).mockResolvedValue('--- PAGE 1 ---\nSome text');
    
    (analyzeTextWithAI as any).mockResolvedValue({
      updateDate: '2024-05-20',
      products: [
        { code: '001', name: 'Product 1', price: 5.00 },
        { code: '001', tar: 10 } // Variation merge
      ]
    });

    const result = await analyzePdfChunks([mockFile], () => {});

    expect(result.updateDate).toBe('2024-05-20');
    expect(result.products).toHaveLength(1);
    expect(result.products[0]).toEqual({
      code: '001',
      name: 'Product 1',
      price: 5.00,
      tar: 10
    });
  });

  it('should handle multiple files and take latest updateDate', async () => {
    const file1 = new File([''], '1.pdf');
    const file2 = new File([''], '2.pdf');
    
    (extractTextFromPDF as any).mockResolvedValue('text');
    
    (analyzeTextWithAI as any)
      .mockResolvedValueOnce({ updateDate: '2024-05-01', products: [{ code: '1' }] })
      .mockResolvedValueOnce({ updateDate: '2024-05-10', products: [{ code: '2' }] });

    const result = await analyzePdfChunks([file1, file2], () => {});
    
    expect(result.updateDate).toBe('2024-05-10');
    expect(result.products).toHaveLength(2);
  });

  it('should throw error if no products extracted', async () => {
    const file = new File([''], 'empty.pdf');
    (extractTextFromPDF as any).mockResolvedValue('text');
    (analyzeTextWithAI as any).mockResolvedValue({ products: [] });

    await expect(analyzePdfChunks([file], () => {}))
      .rejects.toThrow("L'estrazione non ha prodotto risultati");
  });

  it('should handle abort signal', async () => {
    const file = new File([''], 'test.pdf');
    const controller = new AbortController();
    controller.abort();

    await expect(analyzePdfChunks([file], () => {}, controller.signal))
      .rejects.toThrow("Operazione annullata");
  });
});

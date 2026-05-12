import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processListiniBatch } from './admProcessor';
import { downloadListinoAsFile } from './admApiService';
import { analyzePdfChunks } from './pdfAnalyzer';

vi.mock('./admApiService', () => ({
  downloadListinoAsFile: vi.fn()
}));

vi.mock('./pdfAnalyzer', () => ({
  analyzePdfChunks: vi.fn()
}));

describe('admProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('processListiniBatch should process all files', async () => {
    const listini = [{ url: 't1', title: 'T1', date: '2026-05-12', category: 'C1', status: 'A', type: 'P' }];
    vi.mocked(downloadListinoAsFile).mockResolvedValue(new File([], 'test.pdf'));
    vi.mocked(analyzePdfChunks).mockResolvedValue({
      updateDate: '2026-05-12',
      products: [{ code: '1', category: 'C1' }]
    });

    const progress = { setStatus: vi.fn() };
    const result = await processListiniBatch(listini as any, 'model', progress);
    
    expect(result.products[0].listinoDate).toBe('2026-05-12');
    expect(downloadListinoAsFile).toHaveBeenCalledOnce();
    expect(analyzePdfChunks).toHaveBeenCalledOnce();
  });
});

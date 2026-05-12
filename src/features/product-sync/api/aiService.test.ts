import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeTextWithAI } from './aiService';
import { auth } from '@/shared/api';

vi.mock('@/shared/api', () => ({
  auth: {
    currentUser: {
      getIdToken: vi.fn().mockResolvedValue('fake-token')
    }
  }
}));

global.fetch = vi.fn();

describe('aiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('analyzeTextWithAI should return results from server', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, result: { products: [{ code: '101', name: 'Test' }] } })
    } as any);

    const result = await analyzeTextWithAI('file.pdf', 'some text');
    expect(result.products).toHaveLength(1);
    expect(result.products[0].code).toBe('101');
  });

  it('should throw error if fetch fails', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Server Error' })
    } as any);

    await expect(analyzeTextWithAI('file.pdf', 'some text')).rejects.toThrow('Server Error');
  });
});

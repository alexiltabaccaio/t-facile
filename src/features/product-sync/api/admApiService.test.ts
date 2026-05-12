import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchListini, downloadListinoAsFile } from './admApiService';
import { auth } from '@/shared/api';

vi.mock('@/shared/api', () => ({
  auth: {
    currentUser: {
      getIdToken: vi.fn().mockResolvedValue('fake-token')
    }
  }
}));

global.fetch = vi.fn();

describe('admApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchListini should return data correctly', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ success: true, listini: [{ url: 'test', title: 'Test', date: '2026', category: 'Sigarette', status: 'Attivo', type: 'P' }] }))
    } as any);

    const result = await fetchListini();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Test');
  });

  it('downloadListinoAsFile should create a File object', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ success: true, base64: 'UGRmRGF0YQ==' })) // "PdfData" in base64
    } as any);

    const listino = { url: 'test', title: 'Test', date: '20/05/2024', category: 'Sigarette', status: 'Attivo', type: 'P' };
    const result = await downloadListinoAsFile(listino);
    
    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('att_sigarette_200524.pdf');
  });
});

// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from './app';

// Mock Firebase Admin to avoid real network calls
vi.mock('./firebaseAdmin', () => ({
  adminAuth: {
    verifyIdToken: vi.fn()
  },
  getDb: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn()
      }))
    }))
  })),
  adminDb: {}
}));

describe('Security Tests', () => {
  let app: any;

  beforeEach(async () => {
    app = await createApp();
    vi.clearAllMocks();
  });

  describe('Authentication (authMiddleware)', () => {
    it('should reject requests without authorization header', async () => {
      const response = await request(app).get('/api/adm/listini');
      expect(response.status).toBe(401);
    });

    it('should reject requests with invalid tokens', async () => {
      const { adminAuth } = await import('./firebaseAdmin');
      (adminAuth.verifyIdToken as any).mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .get('/api/adm/listini')
        .set('Authorization', 'Bearer invalid');
      
      expect(response.status).toBe(401);
    });

    it('should reject non-admin users (403)', async () => {
      const { adminAuth, getDb } = await import('./firebaseAdmin');
      (adminAuth.verifyIdToken as any).mockResolvedValue({ uid: 'user123' });
      (getDb as any)().collection().doc().get.mockResolvedValue({ exists: false });

      const response = await request(app)
        .get('/api/adm/listini')
        .set('Authorization', 'Bearer valid-user-token');
      
      expect(response.status).toBe(403);
    });
  });

  describe('SSRF Protection (admRoutes)', () => {
    beforeEach(async () => {
       // Mock success auth for SSRF tests
       const { adminAuth, getDb } = await import('./firebaseAdmin');
       (adminAuth.verifyIdToken as any).mockResolvedValue({ uid: 'admin123' });
       (getDb as any)().collection().doc().get.mockResolvedValue({ exists: true });
    });

    it('should reject downloads from unauthorized hostnames', async () => {
      const response = await request(app)
        .get('/api/adm/download')
        .query({ url: 'https://evil.com/malicious.pdf' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Hostname non autorizzato');
    });

    it('should extract path from valid ADM URLs', async () => {
      // This test checks if it reaches the service (which we might mock or let fail on fetch)
      const response = await request(app)
        .get('/api/adm/download')
        .query({ url: 'https://www.adm.gov.it/test.pdf' });
      
      // If it reaches the service and fetch fails (no network in vitest or wrong path), it might be 500
      // but it definitely shouldn't be 400 (SSRF block)
      expect(response.status).not.toBe(400);
    });
  });
});

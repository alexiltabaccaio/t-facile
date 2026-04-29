import { describe, it, expect } from 'vitest';
import { getFileMetadata, createPrompts } from './pdfPromptFactory';

describe('pdfPromptFactory', () => {
  describe('getFileMetadata', () => {
    it('should detect Radiato from filename prefix', () => {
      const meta = getFileMetadata('rad_test.pdf');
      expect(meta.type).toBe('Radiato');
      expect(meta.forcedStatus).toBe('Radiato');
    });

    it('should detect Attivo from filename prefix', () => {
      const meta = getFileMetadata('att_listino.pdf');
      expect(meta.type).toBe('Attivo');
      expect(meta.forcedStatus).toBe('Attivo');
    });

    it('should detect Emissione from filename prefix', () => {
      const meta = getFileMetadata('emi_levels.pdf');
      expect(meta.type).toBe('Emissione');
      expect(meta.forcedStatus).toBe('Attivo');
    });

    it('should detect category from text content', () => {
      const meta = getFileMetadata('data.pdf', 'Questo listino contiene SIGARETTE ESTERE');
      expect(meta.forcedCategory).toBe('Sigarette');
    });

    it('should detect category "Trinciati" from text', () => {
      const meta = getFileMetadata('list.pdf', 'TRINCIATI A MANO');
      expect(meta.forcedCategory).toBe('Trinciati');
    });

    it('should detect "Fiuto e Mastico"', () => {
      const meta = getFileMetadata('list.pdf', 'TABACCHI DA FIUTO');
      expect(meta.forcedCategory).toBe('Fiuto e Mastico');
    });

    it('should detect status from text indicators', () => {
      const meta = getFileMetadata('file.pdf', 'Tabacchi radiati dal listino');
      expect(meta.forcedStatus).toBe('Radiato');
      expect(meta.type).toBe('Radiato');
    });
  });

  describe('createPrompts', () => {
    it('should create Emission prompt for Emission type', () => {
      const prompts = createPrompts('emi_test.pdf', 'nicotine levels');
      expect(prompts.systemPrompt).toContain('EMISSIONI ADM');
      expect(prompts.userPrompt).toContain('TIPO: DATI EMISSIONI');
    });

    it('should create Radiato prompt for Radiato type', () => {
      const prompts = createPrompts('rad_test.pdf', 'archived items');
      expect(prompts.systemPrompt).toContain('prodotti RADIATI');
      expect(prompts.userPrompt).toContain('STATO DA USARE: Radiato');
    });

    it('should create Standard prompt for Attivo type', () => {
      const prompts = createPrompts('att_test.pdf', 'active list');
      expect(prompts.systemPrompt).toContain('listini ADM');
      expect(prompts.userPrompt).toContain('STATO DA USARE: Attivo');
    });
  });
});

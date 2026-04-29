
export const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const createWordStartRegex = (kw: string): RegExp => new RegExp(`\\b${escapeRegExp(kw)}`, 'i');

export const SYNONYM_MAP: { [key: string]: string[] } = {
  sigaro: ['sigari'],
  sigari: ['sigaro'],
  sigaretta: ['sigarette'],
  sigarette: ['sigaretta'],
  sigaretto: ['sigaretti'],
  sigaretti: ['sigaretto'],
  trinciato: ['trinciati'],
  trinciati: ['trinciato'],
  tabacco: ['tabacchi'],
  tabacchi: ['tabacco'],
};

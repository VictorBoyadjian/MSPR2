import {
  apiDateToIso,
  formatDate,
  formatDateTime,
  formatTime,
  formatDuration,
} from '@/utils/formatDate';

describe('apiDateToIso', () => {
  it('ajoute T et Z aux timestamps UTC sans fuseau', () => {
    expect(apiDateToIso('2024-03-15 14:30:00')).toBe('2024-03-15T14:30:00Z');
  });

  it('laisse intacte une chaîne déjà en ISO avec Z', () => {
    expect(apiDateToIso('2024-03-15T14:30:00Z')).toBe('2024-03-15T14:30:00Z');
  });

  it('laisse intacte une chaîne avec offset positif', () => {
    expect(apiDateToIso('2024-03-15T14:30:00+02:00')).toBe('2024-03-15T14:30:00+02:00');
  });

  it('laisse intacte une chaîne avec offset négatif', () => {
    expect(apiDateToIso('2024-03-15T14:30:00-05:00')).toBe('2024-03-15T14:30:00-05:00');
  });

  it('retourne la valeur si vide', () => {
    expect(apiDateToIso('')).toBe('');
  });
});

describe('formatDate', () => {
  it('formate une date valide au format fr-FR', () => {
    const result = formatDate('2024-03-15 00:00:00');
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2024/);
  });

  it('retourne une chaîne vide pour une date invalide', () => {
    expect(formatDate('invalid-date')).toBe('');
  });

  it('accepte un objet Date', () => {
    const result = formatDate(new Date('2024-06-01T00:00:00Z'));
    expect(result).toMatch(/2024/);
  });
});

describe('formatDateTime', () => {
  it('formate date et heure en fr-FR (contient le jour et les minutes)', () => {
    const result = formatDateTime('2024-03-15 14:30:00');
    // Le jour doit toujours être 15 ; l'heure peut varier selon le fuseau local
    expect(result).toMatch(/15/);
    expect(result).toMatch(/30/);
    expect(result.length).toBeGreaterThan(5);
  });

  it('retourne une chaîne vide pour une date invalide', () => {
    expect(formatDateTime('not-a-date')).toBe('');
  });
});

describe('formatTime', () => {
  it('formate uniquement l\'heure en fr-FR (contient les minutes)', () => {
    // On teste avec un objet Date pour contrôler les valeurs locales
    const d = new Date(2024, 2, 15, 9, 5, 0); // 9h05 heure locale
    const result = formatTime(d);
    expect(result).toMatch(/09/);
    expect(result).toMatch(/05/);
  });

  it('retourne une chaîne vide pour une date invalide', () => {
    expect(formatTime('bad')).toBe('');
  });
});

describe('formatDuration', () => {
  it('affiche les minutes seules si < 60', () => {
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(1)).toBe('1 min');
  });

  it('affiche les heures et minutes', () => {
    expect(formatDuration(90)).toBe('1 h 30 min');
    expect(formatDuration(75)).toBe('1 h 15 min');
  });

  it('affiche uniquement les heures si 0 minutes restantes', () => {
    expect(formatDuration(60)).toBe('1 h');
    expect(formatDuration(120)).toBe('2 h');
  });
});

import { startOfDay, addDays, isSameDay, formatDayLabel } from '@/utils/day';

describe('startOfDay', () => {
  it('met l\'heure à minuit', () => {
    const d = new Date('2024-06-15T14:30:00');
    const start = startOfDay(d);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);
  });

  it('ne modifie pas la date originale', () => {
    const d = new Date('2024-06-15T14:30:00');
    startOfDay(d);
    expect(d.getHours()).toBe(14);
  });
});

describe('addDays', () => {
  it('ajoute des jours correctement', () => {
    const base = new Date('2024-06-15T00:00:00');
    const result = addDays(base, 3);
    expect(result.getDate()).toBe(18);
    expect(result.getMonth()).toBe(5);
  });

  it('soustrait des jours avec un montant négatif', () => {
    const base = new Date('2024-06-15T00:00:00');
    const result = addDays(base, -2);
    expect(result.getDate()).toBe(13);
  });

  it('passe au mois suivant si nécessaire', () => {
    const base = new Date('2024-01-30T00:00:00');
    const result = addDays(base, 3);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(2);
  });
});

describe('isSameDay', () => {
  it('retourne true pour deux dates le même jour', () => {
    const a = new Date('2024-06-15T08:00:00');
    const b = new Date('2024-06-15T22:59:59');
    expect(isSameDay(a, b)).toBe(true);
  });

  it('retourne false pour deux dates différentes', () => {
    const a = new Date('2024-06-15T23:59:59');
    const b = new Date('2024-06-16T00:00:01');
    expect(isSameDay(a, b)).toBe(false);
  });
});

describe('formatDayLabel', () => {
  it('retourne "Aujourd\'hui" pour la date courante', () => {
    const today = new Date();
    expect(formatDayLabel(today)).toBe("Aujourd'hui");
  });

  it('retourne "Hier" pour hier', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatDayLabel(yesterday)).toBe('Hier');
  });

  it('retourne "Demain" pour demain', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(formatDayLabel(tomorrow)).toBe('Demain');
  });

  it('retourne une date formatée (avec jour de la semaine) pour les autres jours', () => {
    const past = new Date('2020-01-01T00:00:00');
    const label = formatDayLabel(past);
    // Le format fr-FR inclut le jour de la semaine et le mois mais pas l'année
    expect(label.length).toBeGreaterThan(5);
    expect(label).toMatch(/janvier/);
  });
});

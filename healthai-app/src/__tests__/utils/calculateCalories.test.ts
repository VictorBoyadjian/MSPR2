import {
  calculateTotalCalories,
  calculateMacros,
  calculateCaloriesBurned,
} from '@/utils/calculateCalories';

describe('calculateTotalCalories', () => {
  it('retourne 0 pour un tableau vide', () => {
    expect(calculateTotalCalories([])).toBe(0);
  });

  it('retourne 0 quelle que soit l\'entrée (implémentation stub)', () => {
    expect(calculateTotalCalories([1, 2, 3])).toBe(0);
  });
});

describe('calculateMacros', () => {
  it('retourne les macros à 0 pour un tableau vide', () => {
    expect(calculateMacros([])).toEqual({ proteins: 0, carbs: 0, fats: 0 });
  });

  it('retourne toujours les macros à 0 (stub)', () => {
    const result = calculateMacros([{ calories: 500 }]);
    expect(result.proteins).toBe(0);
    expect(result.carbs).toBe(0);
    expect(result.fats).toBe(0);
  });
});

describe('calculateCaloriesBurned', () => {
  it('retourne 0 pour n\'importe quel workout (stub)', () => {
    expect(calculateCaloriesBurned(null)).toBe(0);
    expect(calculateCaloriesBurned({ duration: 60 })).toBe(0);
  });
});


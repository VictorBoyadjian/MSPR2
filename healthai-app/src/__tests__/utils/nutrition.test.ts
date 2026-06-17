import { toNumber, nextMealType, buildCaloriesInput } from '@/utils/nutrition';
import { User } from '@/types/users.type';

describe('toNumber', () => {
  it('retourne un nombre directement', () => {
    expect(toNumber(42)).toBe(42);
    expect(toNumber(3.14)).toBe(3.14);
  });

  it('convertit une chaîne en nombre', () => {
    expect(toNumber('100')).toBe(100);
    expect(toNumber('3.5')).toBe(3.5);
  });

  it('retourne NaN pour une chaîne non-numérique', () => {
    expect(toNumber('abc')).toBeNaN();
  });

  it('retourne NaN pour undefined', () => {
    expect(toNumber(undefined)).toBeNaN();
  });

  it('retourne 0 pour null (Number(null) === 0)', () => {
    expect(toNumber(null)).toBe(0);
  });
});

describe('nextMealType', () => {
  const makeDate = (hour: number) => {
    const d = new Date();
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  it('retourne "breakfast" avant 11h', () => {
    expect(nextMealType(makeDate(7))).toBe('breakfast');
    expect(nextMealType(makeDate(10))).toBe('breakfast');
  });

  it('retourne "lunch" entre 11h et 15h', () => {
    expect(nextMealType(makeDate(11))).toBe('lunch');
    expect(nextMealType(makeDate(14))).toBe('lunch');
  });

  it('retourne "dinner" entre 15h et 19h', () => {
    expect(nextMealType(makeDate(15))).toBe('dinner');
    expect(nextMealType(makeDate(18))).toBe('dinner');
  });

  it('retourne "snack" à partir de 19h', () => {
    expect(nextMealType(makeDate(19))).toBe('snack');
    expect(nextMealType(makeDate(23))).toBe('snack');
  });
});

const mockUser: User = {
  id: 'u1',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  age: 28,
  gender: 'female',
  weight_kg: 65,
  height_cm: 168,
  bodyfat: 22,
  rest_bpm: 68,
  sport_per_week: 4,
  goal_id: 'g1',
  target_weight: 60,
  weeks_to_goal: 8,
  is_premium: false,
  is_active: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

describe('buildCaloriesInput', () => {
  it('construit l\'input correctement', () => {
    const result = buildCaloriesInput(mockUser, 'weightloss');
    expect(result).not.toBeNull();
    expect(result!.age).toBe(28);
    expect(result!.gender).toBe('female');
    expect(result!.weight_kg).toBe(65);
    expect(result!.height_cm).toBe(168);
    expect(result!.target_weight_kg).toBe(60);
    expect(result!.weeks_to_goal).toBe(8);
    expect(result!.profile).toBe('weightloss');
  });

  it('retourne null si target_weight est NaN (toNumber retourne NaN)', () => {
    // target_weight: null → toNumber(null) = 0, donc buildCaloriesInput ne retourne PAS null
    // On teste avec une string invalide pour déclencher NaN
    expect(buildCaloriesInput({ ...mockUser, target_weight: 'abc' as unknown as number }, 'weightloss')).toBeNull();
  });

  it('retourne null si profile null', () => {
    expect(buildCaloriesInput(mockUser, null)).toBeNull();
  });

  it('convertit gender "other" en "male"', () => {
    const result = buildCaloriesInput({ ...mockUser, gender: 'other' }, 'endurance');
    expect(result!.gender).toBe('male');
  });

  it('borne les valeurs extrêmes', () => {
    const extreme: User = {
      ...mockUser,
      age: 5,
      weight_kg: 500,
      height_cm: 300,
      target_weight: 1,   // trop petit → clamped à 30.1
      weeks_to_goal: 200,
    };
    const result = buildCaloriesInput(extreme, 'muscle_gain');
    expect(result!.age).toBe(18);
    expect(result!.weight_kg).toBe(199.9);
    expect(result!.height_cm).toBe(214.9);
    expect(result!.target_weight_kg).toBe(30.1); // clamp(1, 30.1, 199.9) = 30.1
    expect(result!.weeks_to_goal).toBe(104);
  });
});

import { MEAL_TYPE_ORDER, MEAL_LABELS } from '@/constants/meals';
import { ROUTES } from '@/constants/routes';
import { Fonts } from '@/constants/theme/fonts';

describe('MEAL_TYPE_ORDER', () => {
  it('contient les 4 types de repas dans le bon ordre', () => {
    expect(MEAL_TYPE_ORDER).toEqual(['breakfast', 'lunch', 'dinner', 'snack']);
  });
});

describe('MEAL_LABELS', () => {
  it('traduit breakfast en français', () => {
    expect(MEAL_LABELS.breakfast).toBe('Petit déjeuner');
  });

  it('traduit lunch en français', () => {
    expect(MEAL_LABELS.lunch).toBe('Déjeuner');
  });

  it('traduit dinner en français', () => {
    expect(MEAL_LABELS.dinner).toBe('Dîner');
  });

  it('traduit snack en français', () => {
    expect(MEAL_LABELS.snack).toBe('Collation');
  });

  it('couvre tous les types de MEAL_TYPE_ORDER', () => {
    for (const type of MEAL_TYPE_ORDER) {
      expect(MEAL_LABELS[type]).toBeDefined();
    }
  });
});

describe('ROUTES', () => {
  it('LOGIN pointe vers la route auth/login', () => {
    expect(ROUTES.LOGIN).toBe('/(auth)/login');
  });

  it('REGISTER pointe vers la route auth/register', () => {
    expect(ROUTES.REGISTER).toBe('/(auth)/register');
  });

  it('contient toutes les routes principales', () => {
    expect(ROUTES).toMatchObject({
      LOGIN: expect.any(String),
      REGISTER: expect.any(String),
      DISHES: expect.any(String),
      EXERCICES: expect.any(String),
      SPORT_SESSIONS: expect.any(String),
      METRICS: expect.any(String),
      GOALS: expect.any(String),
    });
  });
});

describe('Fonts', () => {
  it('est défini', () => {
    expect(Fonts).toBeDefined();
  });

  it('contient les familles de polices attendues', () => {
    expect(Fonts).toMatchObject(
      expect.objectContaining({
        sans: expect.any(String),
        serif: expect.any(String),
        mono: expect.any(String),
      }),
    );
  });
});

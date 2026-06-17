import {
  clamp,
  experienceFromSport,
  buildRecommendInputFromUser,
  rankByName,
  orderGoals,
} from '@/utils/recommendation';
import { User } from '@/types/users.type';
import { RecommendOutput } from '@/types/recommendation.type';
import { Goal } from '@/types/goals.type';

describe('clamp', () => {
  it('retourne la valeur si dans l\'intervalle', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('retourne lo si la valeur est inférieure', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('retourne hi si la valeur est supérieure', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('experienceFromSport', () => {
  it('retourne beginner si < 3 h/semaine', () => {
    expect(experienceFromSport(0)).toBe('beginner');
    expect(experienceFromSport(2)).toBe('beginner');
  });

  it('retourne intermediate entre 3 et 8 h/semaine', () => {
    expect(experienceFromSport(3)).toBe('intermediate');
    expect(experienceFromSport(8)).toBe('intermediate');
  });

  it('retourne advanced si > 8 h/semaine', () => {
    expect(experienceFromSport(9)).toBe('advanced');
    expect(experienceFromSport(20)).toBe('advanced');
  });
});

const mockUser: User = {
  id: 'u1',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  age: 30,
  gender: 'male',
  weight_kg: 75,
  height_cm: 180,
  bodyfat: 15,
  rest_bpm: 65,
  sport_per_week: 5,
  goal_id: null,
  target_weight: 70,
  weeks_to_goal: 12,
  is_premium: false,
  is_active: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

describe('buildRecommendInputFromUser', () => {
  it('construit l\'input correctement depuis un utilisateur complet', () => {
    const result = buildRecommendInputFromUser(mockUser);
    expect(result.age).toBe(30);
    expect(result.gender).toBe('male');
    expect(result.weight_kg).toBe(75);
    expect(result.height_cm).toBe(180);
    expect(result.body_fat_pct).toBe(15);
    expect(result.resting_bpm).toBe(65);
    expect(result.experience_level).toBe('intermediate');
  });

  it('convertit gender "female" correctement', () => {
    const result = buildRecommendInputFromUser({ ...mockUser, gender: 'female' });
    expect(result.gender).toBe('female');
  });

  it('convertit gender "other" en "male"', () => {
    const result = buildRecommendInputFromUser({ ...mockUser, gender: 'other' });
    expect(result.gender).toBe('male');
  });

  it('borne les valeurs extrêmes', () => {
    const extreme: User = {
      ...mockUser,
      age: 100,
      weight_kg: 300,
      height_cm: 250,
      bodyfat: 90,
      rest_bpm: 200,
    };
    const result = buildRecommendInputFromUser(extreme);
    expect(result.age).toBe(65);
    expect(result.weight_kg).toBe(199.9);
    expect(result.height_cm).toBe(214.9);
    expect(result.body_fat_pct).toBe(55);
    expect(result.resting_bpm).toBe(105);
  });

  it('utilise des valeurs par défaut si null', () => {
    const nullUser: User = {
      ...mockUser,
      age: null,
      weight_kg: null,
      height_cm: null,
      bodyfat: null,
      rest_bpm: null,
      sport_per_week: null,
    };
    const result = buildRecommendInputFromUser(nullUser);
    expect(result.age).toBe(30);
    expect(result.weight_kg).toBe(70);
    expect(result.height_cm).toBe(175);
  });
});

const mockProgram = {
  sessions_per_week: 3,
  session_duration_min: 45,
  focus: 'cardio',
  intensity: 'moderate',
  weekly_volume_h: 2.25,
  progression: 'linear',
  nutrition_tip: 'eat well',
  objective: 'lose weight',
};

describe('rankByName', () => {
  const reco: RecommendOutput = {
    prediction_id: 'pred1',
    profile: 'weightloss',
    confidence: 0.9,
    bmi: 22,
    bmi_category: 'normal',
    program: mockProgram,
    top_profiles: [
      { profile: 'weightloss', confidence: 0.9 },
      { profile: 'muscle_gain', confidence: 0.7 },
    ],
  };

  it('crée une map rang/confidence par profil', () => {
    const rank = rankByName(reco);
    expect(rank.get('weightloss')).toEqual({ rank: 0, confidence: 0.9 });
    expect(rank.get('muscle_gain')).toEqual({ rank: 1, confidence: 0.7 });
  });

  it('retourne une map vide si reco null', () => {
    expect(rankByName(null).size).toBe(0);
  });
});

describe('orderGoals', () => {
  const goals: Goal[] = [
    { id: '1', name: 'endurance', label: 'Endurance', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: '2', name: 'weightloss', label: 'Perte de poids', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: '3', name: 'muscle_gain', label: 'Prise de masse', created_at: '2024-01-01', updated_at: '2024-01-01' },
  ];

  it('trie selon le rang ML', () => {
    const reco: RecommendOutput = {
      prediction_id: 'pred2',
      profile: 'muscle_gain',
      confidence: 0.85,
      bmi: 24,
      bmi_category: 'normal',
      program: mockProgram,
      top_profiles: [
        { profile: 'muscle_gain', confidence: 0.85 },
        { profile: 'weightloss', confidence: 0.70 },
      ],
    };
    const rank = rankByName(reco);
    const ordered = orderGoals(goals, rank);
    expect(ordered[0].name).toBe('muscle_gain');
    expect(ordered[1].name).toBe('weightloss');
    expect(ordered[2].name).toBe('endurance');
  });

  it('conserve l\'ordre si aucun rang ML', () => {
    const ordered = orderGoals(goals, new Map());
    expect(ordered.map((g) => g.name)).toEqual(['endurance', 'weightloss', 'muscle_gain']);
  });
});

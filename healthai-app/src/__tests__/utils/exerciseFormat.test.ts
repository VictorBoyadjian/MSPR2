import { exerciseMeta, exercisePrescription, exerciseRest } from '@/utils/exerciseFormat';
import { WorkoutExercise } from '@/types/workout-exercises.type';

const base: WorkoutExercise = {
  id: '1',
  name: 'Squat',
  body_part: 'Jambes',
  category: 'Force',
  equipment: 'Haltères',
  difficulty: null,
  description: null,
  created_at: null,
};

describe('exerciseMeta', () => {
  it('joint les champs non-null avec " · "', () => {
    expect(exerciseMeta(base)).toBe('Jambes · Force · Haltères');
  });

  it('ignore les champs null', () => {
    const ex = { ...base, equipment: null };
    expect(exerciseMeta(ex)).toBe('Jambes · Force');
  });

  it('retourne une chaîne vide si tout est null', () => {
    const ex: WorkoutExercise = { ...base, body_part: null, category: null, equipment: null };
    expect(exerciseMeta(ex)).toBe('');
  });
});

describe('exercisePrescription', () => {
  it('formate séries et reps', () => {
    const ex: WorkoutExercise = { ...base, pivot: { order_num: 1, sets: 3, reps: '12', rest_sec: null, notes: null } };
    expect(exercisePrescription(ex)).toBe('3 séries × 12 reps');
  });

  it('utilise "série" au singulier', () => {
    const ex: WorkoutExercise = { ...base, pivot: { order_num: 1, sets: 1, reps: '10', rest_sec: null, notes: null } };
    expect(exercisePrescription(ex)).toBe('1 série × 10 reps');
  });

  it('affiche seulement les séries si reps absent', () => {
    const ex: WorkoutExercise = { ...base, pivot: { order_num: 1, sets: 4, reps: null, rest_sec: null, notes: null } };
    expect(exercisePrescription(ex)).toBe('4 séries');
  });

  it('retourne une chaîne vide si pas de pivot', () => {
    const ex: WorkoutExercise = { ...base, pivot: null };
    expect(exercisePrescription(ex)).toBe('');
  });
});

describe('exerciseRest', () => {
  it('retourne null si pas de repos défini', () => {
    const ex: WorkoutExercise = { ...base, pivot: { order_num: 1, sets: 3, reps: '10', rest_sec: null, notes: null } };
    expect(exerciseRest(ex)).toBeNull();
  });

  it('formate en secondes si < 60', () => {
    const ex: WorkoutExercise = { ...base, pivot: { order_num: 1, sets: 3, reps: '10', rest_sec: 45, notes: null } };
    expect(exerciseRest(ex)).toBe('45 s');
  });

  it('formate en minutes et secondes', () => {
    const ex: WorkoutExercise = { ...base, pivot: { order_num: 1, sets: 3, reps: '10', rest_sec: 90, notes: null } };
    expect(exerciseRest(ex)).toBe('1 min 30');
  });

  it('formate en minutes entières', () => {
    const ex: WorkoutExercise = { ...base, pivot: { order_num: 1, sets: 3, reps: '10', rest_sec: 120, notes: null } };
    expect(exerciseRest(ex)).toBe('2 min');
  });

  it('retourne null si pivot absent', () => {
    const ex: WorkoutExercise = { ...base, pivot: undefined };
    expect(exerciseRest(ex)).toBeNull();
  });
});

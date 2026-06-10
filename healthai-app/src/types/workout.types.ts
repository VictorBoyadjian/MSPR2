export type Exercise = {
  name: string;
  sets: number;
  reps: number;
  durationSeconds?: number;
};

export type Workout = {
  id: string;
  name: string;
  date: string;
  durationMinutes: number;
  exercises: Exercise[];
  userId: string;
  createdAt: string;
};

export type CreateWorkoutDto = Omit<Workout, 'id' | 'userId' | 'createdAt'>;

export type UpdateWorkoutDto = Partial<CreateWorkoutDto>;

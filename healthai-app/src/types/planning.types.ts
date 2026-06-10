export type PlannedWorkout = {
  id: string;
  workoutId: string;
  scheduledDate: string;
  isDone: boolean;
  userId: string;
  createdAt: string;
};

export type CreatePlannedWorkoutDto = {
  workoutId: string;
  scheduledDate: string;
};

export type UpdatePlannedWorkoutDto = Partial<CreatePlannedWorkoutDto> & {
  isDone?: boolean;
};

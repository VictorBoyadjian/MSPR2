import { Exercise } from "./exercises.type";
import { Goal } from "./goals.type";
import { SessionExercise } from "./session-exercises.type";

export type SportSession = {
  id: string;
  duration_min: number | null;
  exercises?: Exercise[];
  goals?: Goal[];
};
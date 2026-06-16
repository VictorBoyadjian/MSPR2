import { Allergy } from '@/types/allergies.type';
import { Handicap } from '@/types/handicaps.type';

export type GenderEnum = "male" | "female" | "other";

export type User = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  gender: GenderEnum | null;
  weight_kg: number | null;
  height_cm: number | null;
  bodyfat: number | null;
  rest_bpm: number | null;
  sport_per_week: number | null;
  goal_id: string | null;
  is_premium: boolean;
  is_active: boolean;
  remember_token?: string | null;
  created_at: string;
  updated_at: string;
  allergies?: Allergy[];
  handicaps?: Handicap[];
};

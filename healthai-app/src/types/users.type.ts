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
  is_premium: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

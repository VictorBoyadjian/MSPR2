export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: "male" | "female" | "other";
  weight_kg: number;
  height_cm: number;
  is_premium: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

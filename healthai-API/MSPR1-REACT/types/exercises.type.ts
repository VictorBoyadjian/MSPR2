export type DifficultyEnum = "debutant" | "intermediaire" | "avance";

export type Exercise = {
  id: string;
  name: string;
  category: string | null;
  body_part: string | null;
  equipment: string | null;
  difficulty: DifficultyEnum | null;
  instructions: string | null;
  source: string | null;
  created_at: Date | null;
};

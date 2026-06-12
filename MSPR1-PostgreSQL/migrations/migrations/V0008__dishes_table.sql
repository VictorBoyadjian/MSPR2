CREATE TABLE "dishes" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "calories_kcal" FLOAT,
  "proteins_g" FLOAT,
  "carbs_g" FLOAT,
  "fats_g" FLOAT,
  "fiber_g" FLOAT,
  "sugars_g" FLOAT,
  "sodium_mg" FLOAT,
  "cholesterol_mg" FLOAT,
  "meal_type" VARCHAR(50),
  "is_scanned" bool,
  "user_id" INT REFERENCES users(id) ON DELETE CASCADE,
  "eated_at" timestamp,
  "created_at" TIMESTAMP DEFAULT (NOW()),
  "updated_at" TIMESTAMP DEFAULT (NOW())
);


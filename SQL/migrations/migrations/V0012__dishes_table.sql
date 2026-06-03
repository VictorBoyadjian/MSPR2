CREATE TABLE "dishes" (
  "id" SERIAL PRIMARY KEY,
  "name" "VARCHAR(255)" NOT NULL,
  "calories_kcal" "DOUBLEPRECISION",
  "proteins_g" "DOUBLEPRECISION",
  "carbs_g" "DOUBLEPRECISION",
  "fats_g" "DOUBLEPRECISION",
  "fiber_g" "DOUBLEPRECISION",
  "sugars_g" "DOUBLEPRECISION",
  "sodium_mg" "DOUBLEPRECISION",
  "cholesterol_mg" "DOUBLEPRECISION",
  "meal_type" "VARCHAR(50)",
  "is_scanned" bool,
  "user_id" INT REFERENCES users(id) ON DELETE CASCADE,
  "image_id" INT REFERENCES images(id) ON DELETE SET NULL,
  "eated_at" timestamp,
  "created_at" TIMESTAMP DEFAULT (NOW()),
  "updated_at" TIMESTAMP DEFAULT (NOW())
);


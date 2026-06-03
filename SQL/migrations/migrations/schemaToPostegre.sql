CREATE TABLE "exercises" (
  "id" SERIAL PRIMARY KEY,
  "name" "VARCHAR(255)" NOT NULL,
  "category" "VARCHAR(100)",
  "body_part" "VARCHAR(100)",
  "equipment" "VARCHAR(100)",
  "difficulty" "VARCHAR(50)",
  "instructions" TEXT,
  "source" "VARCHAR(100)",
  "created_at" TIMESTAMP DEFAULT (NOW()),
  "updated_at" TIMESTAMP DEFAULT (NOW())
);

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
  "created_at" TIMESTAMP DEFAULT (NOW()),
  "updated_at" TIMESTAMP DEFAULT (NOW())
);

CREATE TABLE "goals" (
  "id" SERIAL PRIMARY KEY,
  "name" "VARCHAR(255)" NOT NULL,
  "created_at" TIMESTAMP DEFAULT (NOW()),
  "updated_at" TIMESTAMP DEFAULT (NOW())
);

CREATE TABLE "user_dishes" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER,
  "dish_id" integer,
  "eated_at" timestamp
);

CREATE TABLE "dish_goals" (
  "dish_id" INTEGER,
  "goal_id" integer
);

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "email" "VARCHAR(255)" UNIQUE,
  "password" "VARCHAR(255)",
  "first_name" "VARCHAR(100)",
  "last_name" "VARCHAR(100)",
  "age" INTEGER,
  "gender" "VARCHAR(20)",
  "weight_kg" "DOUBLEPRECISION",
  "height_cm" "DOUBLEPRECISION",
  "is_premium" BOOLEAN DEFAULT false,
  "is_active" BOOLEAN DEFAULT true,
  "remember_token" "VARCHAR(100)",
  "goal_id" INTEGER,
  "created_at" TIMESTAMP DEFAULT (NOW()),
  "updated_at" TIMESTAMP DEFAULT (NOW())
);

CREATE TABLE "metrics" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "recorded_at" TIMESTAMP DEFAULT (NOW()),
  "weight_kg" "DOUBLEPRECISION",
  "bmi" "DOUBLEPRECISION",
  "body_fat_pct" "DOUBLEPRECISION",
  "heart_rate_avg" INTEGER,
  "heart_rate_max" INTEGER,
  "heart_rate_resting" INTEGER,
  "calories_burned" "DOUBLEPRECISION",
  "session_duration_h" "DOUBLEPRECISION",
  "workout_type" "VARCHAR(50)",
  "workout_frequency" INTEGER,
  "water_intake_l" "DOUBLEPRECISION",
  "experience_level" INTEGER,
  "created_at" TIMESTAMP DEFAULT (NOW()),
  "updated_at" TIMESTAMP DEFAULT (NOW())
);

CREATE TABLE "user_sessions" (
  "user_id" INTEGER NOT NULL,
  "session_id" INTEGER NOT NULL,
  "performed_at" TIMESTAMP DEFAULT (NOW())
);

CREATE TABLE "sessions" (
  "id" SERIAL PRIMARY KEY,
  "duration_min" INTEGER,
  "created_at" TIMESTAMP DEFAULT (NOW()),
  "updated_at" TIMESTAMP DEFAULT (NOW())
);

CREATE TABLE "session_goals" (
  "session_id" INTEGER,
  "goal_id" integer
);

CREATE TABLE "session_exercises" (
  "exercise_id" INTEGER NOT NULL,
  "session_id" INTEGER NOT NULL,
  "reps" INTEGER,
  "sets" INTEGER,
  "duration_min" INTEGER,
  PRIMARY KEY ("exercise_id", "session_id")
);

ALTER TABLE "metrics" ADD CONSTRAINT "fk_metrics_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "session_exercises" ADD CONSTRAINT "fk_sessions_exercises_exercise" FOREIGN KEY ("exercise_id") REFERENCES "exercises" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "session_exercises" ADD FOREIGN KEY ("session_id") REFERENCES "sessions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_sessions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_sessions" ADD FOREIGN KEY ("session_id") REFERENCES "sessions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "users" ADD FOREIGN KEY ("goal_id") REFERENCES "goals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_dishes" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_dishes" ADD FOREIGN KEY ("dish_id") REFERENCES "dishes" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "dish_goals" ADD FOREIGN KEY ("dish_id") REFERENCES "dishes" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "dish_goals" ADD FOREIGN KEY ("goal_id") REFERENCES "goals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "session_goals" ADD FOREIGN KEY ("goal_id") REFERENCES "goals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "session_goals" ADD FOREIGN KEY ("session_id") REFERENCES "sessions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

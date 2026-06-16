CREATE TABLE "goals" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT (NOW()),
  "updated_at" TIMESTAMP DEFAULT (NOW())
);

ALTER TABLE users
ADD COLUMN goal_id INT REFERENCES goals(id) ON DELETE SET NULL;

/* Le profil/goal d'une séance est désormais porté par workout_sessions.profile :
   plus de table pivot session_goals. */
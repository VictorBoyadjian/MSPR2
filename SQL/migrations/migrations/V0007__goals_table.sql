CREATE TABLE "goals" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT (NOW()),
  "updated_at" TIMESTAMP DEFAULT (NOW())
);

ALTER TABLE users
ADD COLUMN goal_id INT REFERENCES goals(id) ON DELETE SET NULL;

CREATE TABLE "sport_session_goals" (
  "sport_session_id" INT REFERENCES sport_sessions(id) ON DELETE CASCADE,
  "goal_id" INT REFERENCES goals(id) ON DELETE CASCADE
);
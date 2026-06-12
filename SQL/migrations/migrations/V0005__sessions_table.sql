CREATE TABLE "sport_sessions" (
  "id" SERIAL PRIMARY KEY,
  "duration_min" INTEGER,
  "created_at" TIMESTAMP DEFAULT (NOW()),
  "updated_at" TIMESTAMP DEFAULT (NOW())
);
CREATE TABLE "user_sessions" (
  "user_id" INT REFERENCES users(id) ON DELETE CASCADE,
  "sport_session_id" INT REFERENCES sport_sessions(id) ON DELETE CASCADE,
  "performed_at" TIMESTAMP DEFAULT (NOW())
);

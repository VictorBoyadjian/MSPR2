CREATE INDEX idx_users_email      ON users(email);
CREATE INDEX idx_metrics_user_id  ON metrics(user_id);
CREATE INDEX idx_meal_logs_user   ON meal_logs(user_id);
CREATE INDEX idx_meal_logs_food   ON meal_logs(food_id);
CREATE INDEX idx_sessions_user    ON sessions(user_id);
CREATE INDEX idx_sessions_exercise ON sessions(exercise_id);
CREATE INDEX idx_foods_name       ON foods(name);
CREATE INDEX idx_exercises_name   ON exercises(name);
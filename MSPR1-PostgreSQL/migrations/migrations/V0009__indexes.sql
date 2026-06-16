/* =========================
   INDEX - FITNESS DATABASE
   ========================= */


/* ---------- USERS ---------- */
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_goal_id ON users(goal_id);
CREATE INDEX idx_users_created_at ON users(created_at);


/* ---------- WORKOUT EXERCISES ---------- */
CREATE INDEX idx_workout_exercises_category ON workout_exercises(category);
CREATE INDEX idx_workout_exercises_body_part ON workout_exercises(body_part);
CREATE INDEX idx_workout_exercises_equipment ON workout_exercises(equipment);
CREATE INDEX idx_workout_exercises_difficulty ON workout_exercises(difficulty);
CREATE INDEX idx_workout_exercises_created_at ON workout_exercises(created_at);


/* ---------- METRICS ---------- */
CREATE INDEX idx_metrics_user_id ON metrics(user_id);
CREATE INDEX idx_metrics_user_recorded_at ON metrics(user_id, recorded_at);
CREATE INDEX idx_metrics_recorded_at ON metrics(recorded_at);


/* ---------- WORKOUT SESSIONS ---------- */
CREATE INDEX idx_workout_sessions_profile ON workout_sessions(profile);
CREATE INDEX idx_workout_sessions_created_at ON workout_sessions(created_at);


/* ---------- USER_SESSIONS (séances effectuées / planifiées) ---------- */
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_workout_session_id ON user_sessions(workout_session_id);
CREATE INDEX idx_user_sessions_performed_at ON user_sessions(performed_at);


/* ---------- SESSION_EXERCISES ---------- */
CREATE INDEX idx_session_exercises_session_id ON session_exercises(session_id);
CREATE INDEX idx_session_exercises_exercise_id ON session_exercises(exercise_id);


/* ---------- GOALS ---------- */
CREATE INDEX idx_goals_name ON goals(name);


/* ---------- DISHES ---------- */
CREATE INDEX idx_dishes_user_id ON dishes(user_id);
CREATE INDEX idx_dishes_meal_type ON dishes(meal_type);
CREATE INDEX idx_dishes_created_at ON dishes(created_at);
CREATE INDEX idx_dishes_is_scanned ON dishes(is_scanned);

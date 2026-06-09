/* =========================
   INDEX - FITNESS DATABASE
   ========================= */


/* ---------- USERS ---------- */
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_goal_id ON users(goal_id);
CREATE INDEX idx_users_created_at ON users(created_at);


/* ---------- EXERCISES ---------- */
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_body_part ON exercises(body_part);
CREATE INDEX idx_exercises_equipment ON exercises(equipment);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_exercises_created_at ON exercises(created_at);


/* ---------- METRICS ---------- */
CREATE INDEX idx_metrics_user_id ON metrics(user_id);
CREATE INDEX idx_metrics_user_recorded_at ON metrics(user_id, recorded_at);
CREATE INDEX idx_metrics_recorded_at ON metrics(recorded_at);


/* ---------- SESSIONS ---------- */
CREATE INDEX idx_sport_sessions_created_at ON sport_sessions(created_at);


/* ---------- USER_SESSIONS (many-to-many) ---------- */
CREATE INDEX idx_user_sport_sessions_user_id ON user_sport_sessions(user_id);
CREATE INDEX idx_user_sport_sessions_sport_session_id ON user_sport_sessions(sport_session_id);
CREATE INDEX idx_user_sport_sessions_performed_at ON user_sport_sessions(performed_at);


/* ---------- SESSIONS_EXERCISES ---------- */
CREATE INDEX idx_sport_sessions_exercises_sport_session_id ON sport_session_exercises(sport_session_id);
CREATE INDEX idx_sessions_exercises_exercise_id ON sport_session_exercises(exercise_id);

/* ---------- GOALS ---------- */
CREATE INDEX idx_goals_name ON goals(name);


/* ---------- SESSION_GOALS ---------- */
CREATE INDEX idx_sport_session_goals_sport_session_id ON sport_session_goals(sport_session_id);
CREATE INDEX idx_sport_session_goals_goal_id ON sport_session_goals(goal_id);


/* ---------- DISHES ---------- */
CREATE INDEX idx_dishes_user_id ON dishes(user_id);
CREATE INDEX idx_dishes_meal_type ON dishes(meal_type);
CREATE INDEX idx_dishes_created_at ON dishes(created_at);
CREATE INDEX idx_dishes_is_scanned ON dishes(is_scanned);
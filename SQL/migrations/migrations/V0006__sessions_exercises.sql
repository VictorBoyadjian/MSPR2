CREATE TABLE sport_session_exercises (
    exercise_id INT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    sport_session_id INT NOT NULL REFERENCES sport_sessions(id) ON DELETE CASCADE,
    reps INT,
    sets INT,
    duration_min INT,
    PRIMARY KEY (exercise_id, sport_session_id)
);
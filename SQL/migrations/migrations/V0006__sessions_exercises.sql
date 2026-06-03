CREATE TABLE sessions_exercises (
    exercise_id INT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    session_id INT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    reps INT,
    sets INT,
    duration_min INT,
    PRIMARY KEY (exercise_id, session_id)
);
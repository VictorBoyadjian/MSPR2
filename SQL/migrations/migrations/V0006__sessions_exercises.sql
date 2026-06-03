CREATE TABLE sessions_exercises (
    exercise_id INT NOT NULL,
    session_id INT NOT NULL,
    reps INT,
    sets INT,
    duration_min INT,
    PRIMARY KEY (exercise_id, session_id),
    CONSTRAINT fk_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
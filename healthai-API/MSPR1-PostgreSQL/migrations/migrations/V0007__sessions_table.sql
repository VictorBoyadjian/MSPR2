CREATE TABLE sessions (
    id           SERIAL PRIMARY KEY,
    user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id  INT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    duration_min INT,
    sets         INT,
    reps         INT,
    performed_at TIMESTAMP DEFAULT NOW()
);
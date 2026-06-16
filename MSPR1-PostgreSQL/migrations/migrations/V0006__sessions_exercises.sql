/* Composition d'une séance : exercices ordonnés avec séries / reps / repos. */

CREATE TABLE session_exercises (
    id          SERIAL PRIMARY KEY,
    session_id  INT REFERENCES workout_sessions(id) ON DELETE CASCADE,
    exercise_id INT REFERENCES workout_exercises(id),
    order_num   INT NOT NULL,
    sets        INT,
    reps        VARCHAR(100),
    rest_sec    INT,
    notes       TEXT
);

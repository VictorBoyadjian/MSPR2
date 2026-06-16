/* Catalogue d'exercices (orthographe « exercises » conservée : table utilisée ailleurs). */

CREATE TABLE workout_exercises (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,
    body_part   VARCHAR(100),
    category    VARCHAR(100),
    difficulty  VARCHAR(50),
    equipment   VARCHAR(100),
    description TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

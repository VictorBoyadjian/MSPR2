/* Séances types (workout_sessions, le profil/goal est porté directement par la colonne
   profile) + pivot des séances effectuées/planifiées par l'utilisateur (une seule date). */

CREATE TABLE workout_sessions (
    id                 SERIAL PRIMARY KEY,
    name               VARCHAR(255) NOT NULL,
    profile            VARCHAR(100) NOT NULL,
    session_type       VARCHAR(100),
    total_duration_min INTEGER,
    difficulty         VARCHAR(50),
    description        TEXT,
    objective          TEXT,
    created_at         TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_sessions (
    id                 SERIAL PRIMARY KEY,
    user_id            INT REFERENCES users(id) ON DELETE CASCADE,
    workout_session_id INT REFERENCES workout_sessions(id) ON DELETE CASCADE,
    performed_at       TIMESTAMP DEFAULT NOW()
);

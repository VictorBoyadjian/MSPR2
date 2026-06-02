CREATE TABLE metrics (
    id                   SERIAL PRIMARY KEY,
    user_id              INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recorded_at          TIMESTAMP DEFAULT NOW(),
    weight_kg            FLOAT,
    bmi                  FLOAT,
    body_fat_pct         FLOAT,
    heart_rate_avg       INT,
    heart_rate_max       INT,
    heart_rate_resting   INT,
    calories_burned      FLOAT,
    session_duration_h   FLOAT,
    workout_type         VARCHAR(50),
    workout_frequency    INT,
    water_intake_l       FLOAT,
    experience_level     INT
);
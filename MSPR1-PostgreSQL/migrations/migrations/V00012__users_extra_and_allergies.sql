/* Nouvelles colonnes sur users + tables des allergies. */

ALTER TABLE users
    ADD COLUMN bodyfat        FLOAT,
    ADD COLUMN rest_bpm       INTEGER,
    ADD COLUMN sport_per_week FLOAT;

CREATE TABLE allergies (
    id   SERIAL PRIMARY KEY,
    name VARCHAR
);

CREATE TABLE user_allergies (
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    allergy_id INT NOT NULL REFERENCES allergies(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, allergy_id)
);

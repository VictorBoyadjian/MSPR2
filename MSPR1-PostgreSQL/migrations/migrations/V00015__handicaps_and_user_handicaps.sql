/* Table des handicaps + pivot avec users, et seed des valeurs de référence. */

CREATE TABLE handicaps (
    id   SERIAL PRIMARY KEY,
    name VARCHAR
);

CREATE TABLE user_handicaps (
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    handicap_id INT NOT NULL REFERENCES handicaps(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, handicap_id)
);

INSERT INTO handicaps (name) VALUES
    ('bras_droit'),
    ('bras_gauche'),
    ('bras'),
    ('jambe_droite'),
    ('jambe_gauche'),
    ('jambes'),
    ('dos'),
    ('epaules'),
    ('abdominaux'),
    ('pied'),
    ('nuque');

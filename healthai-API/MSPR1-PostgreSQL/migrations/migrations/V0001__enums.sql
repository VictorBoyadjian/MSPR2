CREATE TYPE gender_enum AS ENUM (
    'male',
    'female',
    'other'
);

CREATE TYPE goal_enum AS ENUM (
    'perte_de_poids',
    'prise_de_masse',
    'amelioration_sommeil',
    'maintien_forme',
    'amelioration_cardio'
);

CREATE TYPE difficulty_enum AS ENUM (
    'debutant',
    'intermediaire',
    'avance'
);
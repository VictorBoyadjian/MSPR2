CREATE TABLE exercises (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    category     VARCHAR(100),
    body_part    VARCHAR(100),
    equipment    VARCHAR(100),
    difficulty   difficulty_enum,
    instructions TEXT,
    source       VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
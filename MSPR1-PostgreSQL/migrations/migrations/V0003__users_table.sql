CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE,
    password        VARCHAR(255),
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    age             INT,
    gender          gender_enum,
    weight_kg       FLOAT,
    height_cm       FLOAT,
    is_premium      BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    remember_token  VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
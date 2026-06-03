CREATE TABLE food_categories (
    id SERIAL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),     
    PRIMARY KEY(id)
);
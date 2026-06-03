CREATE TABLE meal_logs (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_id    INT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    meal_type  VARCHAR(50),
    quantity_g FLOAT,
    logged_at  TIMESTAMP DEFAULT NOW()
);
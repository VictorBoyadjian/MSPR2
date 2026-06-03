CREATE TABLE foods (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    food_category_id INT,
    calories_kcal   FLOAT,
    proteins_g      FLOAT,
    carbs_g         FLOAT,
    fats_g          FLOAT,
    fiber_g         FLOAT,
    sugars_g        FLOAT,
    sodium_mg       FLOAT,
    cholesterol_mg  FLOAT,
    meal_type       VARCHAR(50),
    water_intake_ml FLOAT,
    source          VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_food_categories FOREIGN KEY (food_category_id) REFERENCES food_categories(id) ON DELETE CASCADE
);
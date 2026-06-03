REQUIRED_SCHEMAS: dict[str, list[str]] = {
    "users": ["email", "first_name", "last_name", "age", "gender", "weight_kg", "height_cm"],
    "foods": ["name", "calories_kcal", "proteins_g", "carbs_g", "fats_g",
              "fiber_g", "sugars_g", "sodium_mg", "meal_type"],
    "exercises": ["name", "category", "body_part", "equipment", "difficulty", "instructions"],
    "metrics": ["weight_kg", "bmi", "body_fat_pct", "heart_rate_avg",
                "heart_rate_max", "calories_burned", "workout_frequency", "water_intake_l"],
}

NUMERIC_BOUNDS: dict[str, dict[str, tuple[float, float]]] = {
    "users": {
        "age": (10, 100),
        "weight_kg": (1, 500),
        "height_cm": (50, 300),
    },
    "foods": {
        "calories_kcal": (0, 2000),
        "proteins_g": (0, 500),
        "carbs_g": (0, 500),
        "fats_g": (0, 500),
        "fiber_g": (0, 200),
        "sugars_g": (0, 500),
        "sodium_mg": (0, 50000),
    },
    "exercises": {},
    "metrics": {
        "bmi": (10, 60),
        "body_fat_pct": (0, 100),
        "heart_rate_avg": (40, 220),
        "heart_rate_max": (40, 220),
        "calories_burned": (0, 10000),
        "workout_frequency": (0, 14),
        "water_intake_l": (0, 20),
        "weight_kg": (1, 500),
    },
}

ALLOWED_VALUES: dict[str, dict[str, list[str]]] = {
    "users": {
        "gender": ["male", "female", "other"],
    },
    "foods": {
        "meal_type": ["breakfast", "lunch", "dinner", "snack", "side", "other"],
    },
    "exercises": {
        "difficulty": ["debutant", "intermediaire", "avance"],
    },
    "metrics": {},
}

COLUMN_ALIASES: dict[str, dict[str, str]] = {
    "users": {
        "firstname": "first_name",
        "lastname": "last_name",
        "user_email": "email",
        "height": "height_cm",
        "weight": "weight_kg",
        "goal": "objective",
    },
    "foods": {
        "food_item": "name",
        "food_name": "name",
        "item": "name",
        "protein_g": "proteins_g",
        "carbohydrates_g": "carbs_g",
        "fat_g": "fats_g",
    },
    "exercises": {
        "title": "name",
        "type": "category",
        "bodypart": "body_part",
        "level": "difficulty",
        "desc": "instructions",
        # variantes génériques
        "exercise_name": "name",
        "muscle_group": "body_part",
        "gear": "equipment",
        "description": "instructions",
    },
    "metrics": {
        "userid": "user_id",
        "avg_bpm": "heart_rate_avg",
        "max_bpm": "heart_rate_max",
        "resting_bpm": "heart_rate_resting",
        "fat_percentage": "body_fat_pct",
        "body_fat": "body_fat_pct",
        "bodyfat": "body_fat_pct",
        "water_intake_liters": "water_intake_l",
        "water_l": "water_intake_l",
        "workout_frequency_days_week": "workout_frequency",
        "workout_days": "workout_frequency",
        "kcal_burned": "calories_burned",
        "hr_avg": "heart_rate_avg",
        "hr_max": "heart_rate_max",
    },
}

TABLE_MAPPING: dict[str, str] = {
    "users": "users",
    "foods": "foods",
    "exercises": "exercises",
    "metrics": "metrics",
}

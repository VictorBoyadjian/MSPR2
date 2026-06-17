"""Unit tests for Pydantic schemas — validation rules and helpers."""

import pytest
from pydantic import ValidationError

from app.schemas import (
    CaloriesInput,
    FeedbackInput,
    MealsInput,
    RecommendInput,
    SessionInput,
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

VALID_RECOMMEND = dict(
    age=30, gender="male", weight_kg=75.0, height_cm=175.0,
    body_fat_pct=15.0, resting_bpm=65, experience_level="intermediate",
)

VALID_CALORIES = dict(
    age=30, gender="female", weight_kg=65.0, height_cm=165.0,
    target_weight_kg=60.0, weeks_to_goal=12, profile="perte_poids_debutant",
)


# ---------------------------------------------------------------------------
# RecommendInput
# ---------------------------------------------------------------------------

class TestRecommendInput:
    def test_valid_payload_accepted(self):
        r = RecommendInput(**VALID_RECOMMEND)
        assert r.age == 30

    def test_age_below_minimum_rejected(self):
        with pytest.raises(ValidationError):
            RecommendInput(**{**VALID_RECOMMEND, "age": 17})

    def test_age_above_maximum_rejected(self):
        with pytest.raises(ValidationError):
            RecommendInput(**{**VALID_RECOMMEND, "age": 66})

    def test_invalid_gender_rejected(self):
        with pytest.raises(ValidationError):
            RecommendInput(**{**VALID_RECOMMEND, "gender": "other"})

    def test_invalid_experience_level_rejected(self):
        with pytest.raises(ValidationError):
            RecommendInput(**{**VALID_RECOMMEND, "experience_level": "expert"})

    def test_extreme_bmi_rejected(self):
        # height=175, weight=10 → IMC ~3.3 (way below 14)
        with pytest.raises(ValidationError):
            RecommendInput(**{**VALID_RECOMMEND, "weight_kg": 10.0})

    def test_gender_encoded_male(self):
        assert RecommendInput(**VALID_RECOMMEND).gender_encoded() == 1

    def test_gender_encoded_female(self):
        r = RecommendInput(**{**VALID_RECOMMEND, "gender": "female"})
        assert r.gender_encoded() == 0

    def test_experience_encoded_beginner(self):
        r = RecommendInput(**{**VALID_RECOMMEND, "experience_level": "beginner"})
        assert r.experience_encoded() == 1

    def test_experience_encoded_intermediate(self):
        assert RecommendInput(**VALID_RECOMMEND).experience_encoded() == 2

    def test_experience_encoded_advanced(self):
        r = RecommendInput(**{**VALID_RECOMMEND, "experience_level": "advanced"})
        assert r.experience_encoded() == 3


# ---------------------------------------------------------------------------
# CaloriesInput
# ---------------------------------------------------------------------------

class TestCaloriesInput:
    def test_valid_payload_accepted(self):
        c = CaloriesInput(**VALID_CALORIES)
        assert c.profile == "perte_poids_debutant"

    def test_invalid_profile_rejected(self):
        with pytest.raises(ValidationError):
            CaloriesInput(**{**VALID_CALORIES, "profile": "profil_inexistant"})

    def test_weeks_above_maximum_rejected(self):
        with pytest.raises(ValidationError):
            CaloriesInput(**{**VALID_CALORIES, "weeks_to_goal": 105})

    def test_weight_out_of_range_rejected(self):
        with pytest.raises(ValidationError):
            CaloriesInput(**{**VALID_CALORIES, "weight_kg": 5.0})


# ---------------------------------------------------------------------------
# MealsInput
# ---------------------------------------------------------------------------

class TestMealsInput:
    def test_valid_payload_accepted(self):
        m = MealsInput(profile="perte_poids_debutant")
        assert m.allergens_to_exclude == []
        assert m.meal_type is None

    def test_invalid_profile_rejected(self):
        with pytest.raises(ValidationError):
            MealsInput(profile="profil_inconnu")

    def test_unknown_allergen_rejected(self):
        with pytest.raises(ValidationError):
            MealsInput(profile="perte_poids_debutant", allergens_to_exclude=["noix_de_cajou"])

    def test_invalid_meal_type_rejected(self):
        with pytest.raises(ValidationError):
            MealsInput(profile="perte_poids_debutant", meal_type="brunch")

    def test_valid_allergens_and_meal_type_accepted(self):
        m = MealsInput(
            profile="amelioration_cardio",
            allergens_to_exclude=["gluten", "lactose"],
            meal_type="breakfast",
        )
        assert len(m.allergens_to_exclude) == 2


# ---------------------------------------------------------------------------
# SessionInput
# ---------------------------------------------------------------------------

class TestSessionInput:
    def test_valid_payload_accepted(self):
        s = SessionInput(profile="prise_masse_debutant")
        assert s.body_parts_to_exclude == []

    def test_invalid_profile_rejected(self):
        with pytest.raises(ValidationError):
            SessionInput(profile="inconnu")

    def test_unknown_body_region_rejected(self):
        with pytest.raises(ValidationError):
            SessionInput(profile="prise_masse_debutant", body_parts_to_exclude=["tete"])

    def test_valid_body_region_accepted(self):
        s = SessionInput(profile="prise_masse_debutant", body_parts_to_exclude=["dos", "bras"])
        assert "dos" in s.body_parts_to_exclude


# ---------------------------------------------------------------------------
# FeedbackInput
# ---------------------------------------------------------------------------

class TestFeedbackInput:
    def test_valid_payload_accepted(self):
        f = FeedbackInput(prediction_id="abc-123", chosen_profile="maintien_bien_etre")
        assert f.prediction_id == "abc-123"

    def test_invalid_chosen_profile_rejected(self):
        with pytest.raises(ValidationError):
            FeedbackInput(prediction_id="abc-123", chosen_profile="profil_inexistant")

"""Unit tests for FitnessService — pure-logic methods (no DB, no ML models)."""

import pytest

from app.schemas import CaloriesInput, NutritionInput
from app.service import FitnessService, _bmi_category


# ---------------------------------------------------------------------------
# _bmi_category (standalone helper)
# ---------------------------------------------------------------------------

class TestBmiCategory:
    def test_underweight(self):
        assert _bmi_category(17.0) == "Sous-poids"

    def test_normal_lower_boundary(self):
        assert _bmi_category(18.5) == "Normal"

    def test_normal_mid(self):
        assert _bmi_category(22.0) == "Normal"

    def test_overweight_boundary(self):
        assert _bmi_category(25.0) == "Surpoids"

    def test_overweight_mid(self):
        assert _bmi_category(27.5) == "Surpoids"

    def test_obese_boundary(self):
        assert _bmi_category(30.0) == "Obésité"

    def test_obese_high(self):
        assert _bmi_category(45.0) == "Obésité"


# ---------------------------------------------------------------------------
# FitnessService.calculate_calories
# ---------------------------------------------------------------------------

MALE_BASE = dict(
    age=30, gender="male", weight_kg=80.0, height_cm=180.0,
    target_weight_kg=75.0, weeks_to_goal=10, profile="perte_poids_debutant",
)

FEMALE_BASE = dict(
    age=25, gender="female", weight_kg=65.0, height_cm=165.0,
    target_weight_kg=60.0, weeks_to_goal=10, profile="perte_poids_debutant",
)


@pytest.fixture(scope="module")
def service(mock_fitness_service):
    return mock_fitness_service


class TestCalculateCaloriesMale:
    def test_returns_calories_output(self, mock_fitness_service):
        result = mock_fitness_service.calculate_calories(CaloriesInput(**MALE_BASE))
        from app.schemas import CaloriesOutput
        assert isinstance(result, CaloriesOutput)

    def test_goal_type_is_deficit_when_losing_weight(self, mock_fitness_service):
        result = mock_fitness_service.calculate_calories(CaloriesInput(**MALE_BASE))
        assert result.goal_type == "deficit"

    def test_bmr_male_formula(self, mock_fitness_service):
        # Harris-Benedict male: 88.362 + 13.397*80 + 4.799*180 - 5.677*30
        expected_bmr = round(88.362 + 13.397 * 80 + 4.799 * 180 - 5.677 * 30, 1)
        result = mock_fitness_service.calculate_calories(CaloriesInput(**MALE_BASE))
        assert result.bmr == expected_bmr

    def test_total_change_is_negative_for_loss(self, mock_fitness_service):
        result = mock_fitness_service.calculate_calories(CaloriesInput(**MALE_BASE))
        assert result.total_change_kg < 0

    def test_daily_adjustment_capped_at_minus_750(self, mock_fitness_service):
        # Aggressive loss: 20 kg in 4 weeks → raw adjustment < -750
        data = CaloriesInput(**{**MALE_BASE, "target_weight_kg": 60.0, "weeks_to_goal": 4})
        result = mock_fitness_service.calculate_calories(data)
        assert result.daily_adjustment >= -750


class TestCalculateCaloriesFemale:
    def test_bmr_female_formula(self, mock_fitness_service):
        # Harris-Benedict female: 447.593 + 9.247*65 + 3.098*165 - 4.330*25
        expected_bmr = round(447.593 + 9.247 * 65 + 3.098 * 165 - 4.330 * 25, 1)
        result = mock_fitness_service.calculate_calories(CaloriesInput(**FEMALE_BASE))
        assert result.bmr == expected_bmr

    def test_goal_type_surplus_when_gaining_weight(self, mock_fitness_service):
        data = CaloriesInput(**{**FEMALE_BASE, "target_weight_kg": 70.0})
        result = mock_fitness_service.calculate_calories(data)
        assert result.goal_type == "surplus"

    def test_daily_adjustment_capped_at_plus_500(self, mock_fitness_service):
        # Aggressive gain: 20 kg in 4 weeks → raw adjustment > 500
        data = CaloriesInput(**{**FEMALE_BASE, "target_weight_kg": 85.0, "weeks_to_goal": 4})
        result = mock_fitness_service.calculate_calories(data)
        assert result.daily_adjustment <= 500


class TestCalculateCaloriesProtein:
    @pytest.mark.parametrize("profile,ratio", [
        ("perte_poids_debutant",  1.6),
        ("perte_poids_confirme",  2.0),
        ("prise_masse_debutant",  1.8),
        ("prise_masse_confirme",  2.2),
        ("amelioration_cardio",   1.4),
        ("maintien_bien_etre",    1.4),
    ])
    def test_protein_target_per_profile(self, mock_fitness_service, profile, ratio):
        data = CaloriesInput(**{**MALE_BASE, "profile": profile})
        result = mock_fitness_service.calculate_calories(data)
        expected = round(80.0 * ratio, 0)
        assert result.protein_target_g == expected


# ---------------------------------------------------------------------------
# FitnessService.predict_legacy
# ---------------------------------------------------------------------------

class TestPredictLegacy:
    def test_high_bmi_returns_perte_poids(self, mock_fitness_service):
        data = NutritionInput(age=30, poids_kg=100.0, taille_cm=170.0, taux_masse_grasse=30.0)
        result = mock_fitness_service.predict_legacy(data)
        assert result.label == "perte_poids"

    def test_low_bmi_returns_prise_masse(self, mock_fitness_service):
        data = NutritionInput(age=25, poids_kg=55.0, taille_cm=180.0, taux_masse_grasse=10.0)
        result = mock_fitness_service.predict_legacy(data)
        assert result.label == "prise_masse"

    def test_normal_bmi_returns_maintien(self, mock_fitness_service):
        data = NutritionInput(age=28, poids_kg=70.0, taille_cm=175.0, taux_masse_grasse=18.0)
        result = mock_fitness_service.predict_legacy(data)
        assert result.label == "maintien"

    def test_imc_computed_correctly(self, mock_fitness_service):
        data = NutritionInput(age=30, poids_kg=70.0, taille_cm=175.0, taux_masse_grasse=18.0)
        result = mock_fitness_service.predict_legacy(data)
        expected_imc = round(70.0 / (1.75 ** 2), 2)
        assert result.imc == expected_imc

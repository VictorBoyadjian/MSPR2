"""Unit tests for FitnessService — pure-logic methods (no DB, no ML models)."""

import os
from unittest.mock import MagicMock, patch, call

import numpy as np
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


# ---------------------------------------------------------------------------
# Helpers for DB mocking
# ---------------------------------------------------------------------------

def _make_db_mock(rows):
    """Return a (conn_mock, cur_mock) pair that yields `rows` from fetchall."""
    cur = MagicMock()
    cur.__enter__ = MagicMock(return_value=cur)
    cur.__exit__ = MagicMock(return_value=False)
    cur.fetchall.return_value = rows

    conn = MagicMock()
    conn.__enter__ = MagicMock(return_value=conn)
    conn.__exit__ = MagicMock(return_value=False)
    conn.cursor.return_value = cur
    return conn, cur


# ---------------------------------------------------------------------------
# FitnessService.get_meals
# ---------------------------------------------------------------------------

_MEAL_ROW = {
    "name": "Salade César",
    "meal_type": "lunch",
    "calories_kcal": 350.0,
    "proteins_g": 25.0,
    "carbs_g": 15.0,
    "fats_g": 20.0,
    "allergens": [],
}


class TestGetMeals:
    def test_returns_meals_output(self, mock_fitness_service):
        from app.schemas import MealsInput, MealsOutput
        conn, _ = _make_db_mock([_MEAL_ROW])
        data = MealsInput(profile="perte_poids_debutant")
        with patch("psycopg2.connect", return_value=conn), \
             patch.dict(os.environ, {"DATABASE_URL": "postgresql://test"}):
            result = mock_fitness_service.get_meals(data)
        assert isinstance(result, MealsOutput)
        assert result.count == 1
        assert result.meals[0].name == "Salade César"

    def test_returns_empty_when_no_rows(self, mock_fitness_service):
        from app.schemas import MealsInput
        conn, _ = _make_db_mock([])
        data = MealsInput(profile="maintien_bien_etre")
        with patch("psycopg2.connect", return_value=conn), \
             patch.dict(os.environ, {"DATABASE_URL": "postgresql://test"}):
            result = mock_fitness_service.get_meals(data)
        assert result.count == 0
        assert result.meals == []

    def test_raises_without_database_url(self, mock_fitness_service):
        from app.schemas import MealsInput
        data = MealsInput(profile="perte_poids_debutant")
        with patch.dict(os.environ, {}, clear=True):
            os.environ.pop("DATABASE_URL", None)
            with pytest.raises(RuntimeError, match="DATABASE_URL"):
                mock_fitness_service.get_meals(data)

    def test_filters_by_meal_type(self, mock_fitness_service):
        from app.schemas import MealsInput
        conn, cur = _make_db_mock([_MEAL_ROW])
        data = MealsInput(profile="perte_poids_debutant", meal_type="lunch")
        with patch("psycopg2.connect", return_value=conn), \
             patch.dict(os.environ, {"DATABASE_URL": "postgresql://test"}):
            mock_fitness_service.get_meals(data)
        # meal_type filter must appear in the SQL executed
        sql_calls = [str(c) for c in cur.execute.call_args_list]
        assert any("meal_type" in s for s in sql_calls)

    def test_filters_by_allergen(self, mock_fitness_service):
        from app.schemas import MealsInput
        conn, cur = _make_db_mock([])
        data = MealsInput(profile="perte_poids_debutant", allergens_to_exclude=["gluten"])
        with patch("psycopg2.connect", return_value=conn), \
             patch.dict(os.environ, {"DATABASE_URL": "postgresql://test"}):
            mock_fitness_service.get_meals(data)
        sql_calls = [str(c) for c in cur.execute.call_args_list]
        assert any("allergens" in s for s in sql_calls)


# ---------------------------------------------------------------------------
# FitnessService.get_sessions
# ---------------------------------------------------------------------------

_SESSION_ROW = {
    "id": 1,
    "name": "Full Body A",
    "profile": "prise_masse_debutant",
    "session_type": "full_body",
    "total_duration_min": 60,
    "difficulty": "beginner",
    "description": "desc",
    "objective": "obj",
}

_EXERCISE_ROW = {
    "order_num": 1,
    "exercise_name": "Squat",
    "body_part": "Quadriceps",
    "category": "compound",
    "equipment": "barbell",
    "sets": 3,
    "reps": "8-10",
    "rest_sec": 90,
    "notes": None,
}


class TestGetSessions:
    def test_returns_session_output(self, mock_fitness_service):
        from app.schemas import SessionInput, SessionOutput

        cur = MagicMock()
        cur.__enter__ = MagicMock(return_value=cur)
        cur.__exit__ = MagicMock(return_value=False)
        cur.fetchall.side_effect = [[_SESSION_ROW], [_EXERCISE_ROW]]

        conn = MagicMock()
        conn.__enter__ = MagicMock(return_value=conn)
        conn.__exit__ = MagicMock(return_value=False)
        conn.cursor.return_value = cur

        data = SessionInput(profile="prise_masse_debutant")
        with patch("psycopg2.connect", return_value=conn), \
             patch.dict(os.environ, {"DATABASE_URL": "postgresql://test"}):
            result = mock_fitness_service.get_sessions(data)

        assert isinstance(result, SessionOutput)
        assert result.count == 1
        assert result.sessions[0].name == "Full Body A"
        assert result.sessions[0].exercises[0].exercise_name == "Squat"

    def test_returns_empty_when_no_sessions(self, mock_fitness_service):
        from app.schemas import SessionInput
        conn, cur = _make_db_mock([])
        data = SessionInput(profile="amelioration_cardio")
        with patch("psycopg2.connect", return_value=conn), \
             patch.dict(os.environ, {"DATABASE_URL": "postgresql://test"}):
            result = mock_fitness_service.get_sessions(data)
        assert result.count == 0

    def test_raises_without_database_url(self, mock_fitness_service):
        from app.schemas import SessionInput
        data = SessionInput(profile="perte_poids_debutant")
        with patch.dict(os.environ, {}, clear=True):
            os.environ.pop("DATABASE_URL", None)
            with pytest.raises(RuntimeError, match="DATABASE_URL"):
                mock_fitness_service.get_sessions(data)

    def test_body_parts_excluded_filters_exercises(self, mock_fitness_service):
        from app.schemas import SessionInput

        cur = MagicMock()
        cur.__enter__ = MagicMock(return_value=cur)
        cur.__exit__ = MagicMock(return_value=False)
        cur.fetchall.side_effect = [[_SESSION_ROW], []]

        conn = MagicMock()
        conn.__enter__ = MagicMock(return_value=conn)
        conn.__exit__ = MagicMock(return_value=False)
        conn.cursor.return_value = cur

        data = SessionInput(profile="prise_masse_debutant", body_parts_to_exclude=["jambes"])
        with patch("psycopg2.connect", return_value=conn), \
             patch.dict(os.environ, {"DATABASE_URL": "postgresql://test"}):
            result = mock_fitness_service.get_sessions(data)

        sql_calls = [str(c) for c in cur.execute.call_args_list]
        assert any("body_part" in s for s in sql_calls)


# ---------------------------------------------------------------------------
# FitnessService.recommend
# ---------------------------------------------------------------------------

_PROG_DICT = {
    "sessions_per_week": 3, "session_duration_min": 45, "focus": "cardio",
    "intensity": "moderate", "weekly_volume_h": 2.25, "progression": "linear",
    "nutrition_tip": "eat well", "objective": "lose weight",
}

RECOMMEND_DATA = dict(
    age=30, gender="male", weight_kg=75.0, height_cm=175.0,
    body_fat_pct=15.0, resting_bpm=65, experience_level="intermediate",
)


class TestRecommend:
    def _setup_model(self, svc):
        svc._model.predict_proba.return_value = np.array([[0.5, 0.3, 0.2]])
        svc._model.predict.return_value = np.array([0])
        svc._encoder.inverse_transform.return_value = ["perte_poids_debutant"]

    def test_returns_recommend_output(self, mock_fitness_service):
        from app.schemas import RecommendInput, RecommendOutput
        import sys
        self._setup_model(mock_fitness_service)
        sys.modules["ml.src.recommendation_engine.engine"].get_program.return_value = MagicMock()
        sys.modules["ml.src.recommendation_engine.engine"].program_to_dict.return_value = _PROG_DICT

        data = RecommendInput(**RECOMMEND_DATA)
        with patch("app.service.sys_path_appended", True):
            result = mock_fitness_service.recommend(data)

        from app.schemas import RecommendOutput
        assert isinstance(result, RecommendOutput)
        assert result.profile == "perte_poids_debutant"

    def test_prediction_id_is_uuid(self, mock_fitness_service):
        import sys, uuid
        self._setup_model(mock_fitness_service)
        sys.modules["ml.src.recommendation_engine.engine"].get_program.return_value = MagicMock()
        sys.modules["ml.src.recommendation_engine.engine"].program_to_dict.return_value = _PROG_DICT

        from app.schemas import RecommendInput
        data = RecommendInput(**RECOMMEND_DATA)
        with patch("app.service.sys_path_appended", True):
            result = mock_fitness_service.recommend(data)

        uuid.UUID(result.prediction_id)  # raises if not valid UUID

    def test_bmi_computed_in_output(self, mock_fitness_service):
        import sys
        self._setup_model(mock_fitness_service)
        sys.modules["ml.src.recommendation_engine.engine"].get_program.return_value = MagicMock()
        sys.modules["ml.src.recommendation_engine.engine"].program_to_dict.return_value = _PROG_DICT

        from app.schemas import RecommendInput
        data = RecommendInput(**RECOMMEND_DATA)
        with patch("app.service.sys_path_appended", True):
            result = mock_fitness_service.recommend(data)

        expected_bmi = round(75.0 / (1.75 ** 2), 2)
        assert result.bmi == expected_bmi

    def test_raises_when_ml_not_imported(self, mock_fitness_service):
        from app.schemas import RecommendInput
        data = RecommendInput(**RECOMMEND_DATA)
        with patch("app.service.sys_path_appended", False), \
             patch("app.service._IMPORT_ERROR", "module not found", create=True):
            with pytest.raises(RuntimeError, match="Import ML modules failed"):
                mock_fitness_service.recommend(data)

    def test_top_profiles_has_three_entries(self, mock_fitness_service):
        import sys
        svc = mock_fitness_service
        svc._model.predict_proba.return_value = np.array([[0.5, 0.3, 0.2]])
        svc._model.predict.return_value = np.array([0])
        svc._encoder.inverse_transform.side_effect = lambda x: ["perte_poids_debutant"]
        sys.modules["ml.src.recommendation_engine.engine"].get_program.return_value = MagicMock()
        sys.modules["ml.src.recommendation_engine.engine"].program_to_dict.return_value = _PROG_DICT

        from app.schemas import RecommendInput
        data = RecommendInput(**RECOMMEND_DATA)
        with patch("app.service.sys_path_appended", True):
            result = mock_fitness_service.recommend(data)

        assert len(result.top_profiles) == 3

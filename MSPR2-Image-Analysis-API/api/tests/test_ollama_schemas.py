"""Unit tests for ollama_schemas (pydantic models)."""

from api.data_schemas import Food, OutputResponse, UploadDish


class TestUploadDish:
    def test_defaults_to_empty_image(self) -> None:
        assert UploadDish().base64_image == ""

    def test_accepts_provided_image(self) -> None:
        dish = UploadDish(base64_image="abc123")
        assert dish.base64_image == "abc123"


class TestFood:
    def test_default_values(self) -> None:
        food = Food()
        assert food.quantity == 1
        assert food.quantity_g == 20
        assert food.calories_kcal == 500
        assert food.proteins_g == 10.0
        assert food.carbs_g == 12.0
        assert food.fats_g == 2.0
        assert food.fiber_g == 5.6
        assert food.accuracy == 0.85

    def test_int_field_is_coerced_from_float_string(self) -> None:
        # pydantic coerces compatible types
        food = Food(quantity=3, calories_kcal=250)
        assert food.quantity == 3
        assert food.calories_kcal == 250

    def test_float_fields_keep_decimal(self) -> None:
        food = Food(accuracy=0.5, proteins_g=4.2)
        assert food.accuracy == 0.5
        assert food.proteins_g == 4.2


class TestOutputResponse:
    def test_default_contains_bread_example(self) -> None:
        response = OutputResponse()
        assert "bread" in response.aliments
        assert isinstance(response.aliments["bread"], Food)

    def test_accepts_dict_of_food(self) -> None:
        response = OutputResponse(
            aliments={"rice": Food(quantity_g=150, calories_kcal=200)}
        )
        assert "rice" in response.aliments
        assert response.aliments["rice"].quantity_g == 150

    def test_builds_food_from_nested_dict(self) -> None:
        # pydantic validates nested dicts into Food instances
        response = OutputResponse(aliments={"apple": {"calories_kcal": 95}})
        assert isinstance(response.aliments["apple"], Food)
        assert response.aliments["apple"].calories_kcal == 95

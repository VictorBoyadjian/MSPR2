<?php

namespace App\Http\Controllers\Documentation;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: "MSPR1 API",
    version: "1.0.0",
    description: "API for exercise, food, and meal tracking"
)]
#[OA\Server(url: "/", description: "MSPR1 API Server")]
#[OA\SecurityScheme(
    securityScheme: "sanctum",
    type: "http",
    scheme: "bearer"
)]
class ApiDocumentation
{
    // Auth

    #[OA\Post(path: "/api/login", tags: ["Auth"], summary: "Connexion utilisateur")]
    #[OA\RequestBody(content: new OA\JsonContent(properties: [
        new OA\Property(property: "email", type: "string", example: "user@example.com"),
        new OA\Property(property: "password", type: "string", example: "password")
    ]))]
    #[OA\Response(response: 200, description: "User logged in")]
    public function login() {}

    #[OA\Post(path: "/api/register", tags: ["Auth"], summary: "Inscription utilisateur")]
    #[OA\RequestBody(content: new OA\JsonContent(properties: [
        new OA\Property(property: "email", type: "string"),
        new OA\Property(property: "password", type: "string"),
        new OA\Property(property: "first_name", type: "string", example: "Admin"),
        new OA\Property(property: "last_name", type: "string", example: "User"),
        new OA\Property(property: "age", type: "int", example: 30),
        new OA\Property(property: "gender", type: "string", example: "male"),
        new OA\Property(property: "weight_kg", type: "int", example: 80),
        new OA\Property(property: "height_cm", type: "int", example: 180)
    ]))]
    #[OA\Response(response: 200, description: "User registered")]
    public function register() {}

    #[OA\Post(path: "/api/logout", tags: ["Auth"], summary: "Déconnexion", security: [["sanctum" => []]])]
    #[OA\Response(response: 200, description: "Logged out")]
    public function logout() {}

    // Exercises

    #[OA\Post(path: "/api/exercises/search", tags: ["Exercises"], summary: "Rechercher des exercices", security: [["sanctum" => []]])]
    #[OA\Response(response: 200, description: "List exercises")]
    public function exercisesSearch() {}

    #[OA\Post(
    path: "/api/exercises/mutate",
    tags: ["Exercises"],
    summary: "Créer / modifier des exercices",
    security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: "mutate",
                    type: "array",
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: "operation", type: "string", enum: ["create", "update", "delete"], example: "create"),
                            new OA\Property(property: "key", type: "integer", example: 1, description: "Requis pour update/delete"),
                            new OA\Property(
                                property: "attributes",
                                type: "object",
                                properties: [
                                    new OA\Property(property: "name",         type: "string",  example: "Squat"),
                                    new OA\Property(property: "category",     type: "string",  example: "strength"),
                                    new OA\Property(property: "body_part",    type: "string",  example: "legs"),
                                    new OA\Property(property: "equipment",    type: "string",  example: "barbell"),
                                    new OA\Property(property: "difficulty",   type: "string",  example: "intermediaire"),
                                    new OA\Property(property: "instructions", type: "string",  example: "Descendre en gardant le dos droit"),
                                    new OA\Property(property: "source",       type: "string",  example: "https://example.com"),
                                ]
                            ),
                        ]
                    ),
                    example: [
                        [
                            "operation"  => "create",
                            "attributes" => [
                                "name"         => "Squat",
                                "category"     => "strength",
                                "body_part"    => "legs",
                                "equipment"    => "barbell",
                                "difficulty"   => "intermediaire",
                                "instructions" => "Descendre en gardant le dos droit",
                                "source"       => "https://example.com",
                            ]/*,
                            "relations" => [
                                "Sessions" => [
                                    [
                                        "operation" => "attach",
                                        "key" => 0,
                                        "attributes" => ["reps" => 10, "sets" => 3, "duration_min" => 45]
                                    ]
                                ] 
                            ] */
                        ]
                    ]
                ),
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Exercises mutated")]
    public function exercisesMutate() {}

    #[OA\Delete(
    path: "/api/exercises",
    tags: ["Exercises"],
    summary: "Supprimer un exercice",
    security: [["sanctum" => []]],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["resources"],
            properties: [
                new OA\Property(
                    property: "resources",
                    type: "array",
                    items: new OA\Items(type: "integer")
                )
            ]
        )
    )
    )]
    #[OA\Response(
        response: 200,
        description: "Exercise deleted"
    )]
    public function exercisesDelete() {}

// Food Categories

    #[OA\Post(path: "/api/food-categories/search", tags: ["Food Categories"], summary: "Rechercher des catégories", security: [["sanctum" => []]])]
    #[OA\Response(response: 200, description: "List food categories")]
    public function foodCategoriesSearch() {}

    #[OA\Post(path: "/api/food-categories/mutate", tags: ["Food Categories"], summary: "Créer / modifier des catégories", security: [["sanctum" => []]])]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: "mutate",
                    type: "array",
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: "operation", type: "string", enum: ["create", "update", "delete"], example: "create"),
                            new OA\Property(property: "key", type: "integer", example: 1, description: "Requis pour update/delete"),
                            new OA\Property(
                                property: "attributes",
                                type: "object",
                                properties: [
                                    new OA\Property(property: "name", type: "string", example: "Légumes"),
                                ]
                            ),
                        ]
                    ),
                    example: [[
                        "operation"  => "create",
                        "attributes" => ["name" => "proteins"]
                    ]]
                ),
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Food categories mutated")]
    public function foodCategoriesMutate() {}

    // Foods

    #[OA\Post(path: "/api/foods/search", tags: ["Foods"], summary: "Rechercher des aliments", security: [["sanctum" => []]])]
    #[OA\Response(response: 200, description: "List foods")]
    public function foodsSearch() {}

    #[OA\Post(path: "/api/foods/mutate", tags: ["Foods"], summary: "Créer / modifier des aliments", security: [["sanctum" => []]])]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: "mutate",
                    type: "array",
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: "operation", type: "string", enum: ["create", "update", "delete"], example: "create"),
                            new OA\Property(property: "key", type: "integer", example: 1, description: "Requis pour update/delete"),
                            new OA\Property(
                                property: "attributes",
                                type: "object",
                                properties: [
                                    new OA\Property(property: "name",            type: "string",  example: "Poulet grillé"),
                                    new OA\Property(property: "food_category_id",        type: "number",  example: 0),
                                    new OA\Property(property: "calories_kcal",   type: "number",  example: 165),
                                    new OA\Property(property: "proteins_g",      type: "number",  example: 31),
                                    new OA\Property(property: "carbs_g",         type: "number",  example: 0),
                                    new OA\Property(property: "fats_g",          type: "number",  example: 3.6),
                                    new OA\Property(property: "fiber_g",         type: "number",  example: 0),
                                    new OA\Property(property: "sugars_g",        type: "number",  example: 0),
                                    new OA\Property(property: "sodium_mg",        type: "number",  example: 0.07),
                                    new OA\Property(property: "cholesterol_mg",  type: "number",  example: 85),
                                    new OA\Property(property: "meal_type",       type: "string",  example: "lunch"),
                                    new OA\Property(property: "water_intake_ml", type: "number",  example: 0),
                                    new OA\Property(property: "source",          type: "string",  example: "https://example.com"),
                                ]
                            ),
                        ]
                    ),
                    example: [[
                        "operation"  => "create",
                        "attributes" => [
                            "name" => "Poulet grillé", "food_category_id" => 0, "calories_kcal" => 165,
                            "proteins_g" => 31, "carbs_g" => 0, "fats_g" => 3.6, "fiber_g" => 0,
                            "sugars_g" => 0, "sodium_mg" => 0.07, "cholesterol_mg" => 85,
                            "meal_type" => "lunch", "water_intake_ml" => 0, "source" => "https://example.com",
                        ]
                    ]]
                ),
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Foods mutated")]
    public function foodsMutate() {}

    #[OA\Delete(
    path: "/api/foods",
    tags: ["Foods"],
    summary: "Supprimer un aliment",
    security: [["sanctum" => []]],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["resources"],
            properties: [
                new OA\Property(
                    property: "resources",
                    type: "array",
                    items: new OA\Items(type: "integer")
                )
            ]
        )
    )
    )]
    #[OA\Response(
        response: 200,
        description: "Food deleted"
    )]
    public function foodsDelete() {}

    // Meal Logs

    #[OA\Post(path: "/api/meal-logs/search", tags: ["Meal Logs"], summary: "Rechercher des logs de repas", security: [["sanctum" => []]])]
    #[OA\Response(response: 200, description: "List meal logs")]
    public function mealLogsSearch() {}

    #[OA\Post(path: "/api/meal-logs/mutate", tags: ["Meal Logs"], summary: "Créer / modifier des logs de repas", security: [["sanctum" => []]])]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: "mutate",
                    type: "array",
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: "operation", type: "string", enum: ["create", "update", "delete"], example: "create"),
                            new OA\Property(property: "key", type: "integer", example: 1, description: "Requis pour update/delete"),
                            new OA\Property(
                                property: "attributes",
                                type: "object",
                                properties: [
                                    new OA\Property(property: "user_id",    type: "integer", example: 1),
                                    new OA\Property(property: "food_id",    type: "integer", example: 1),
                                    new OA\Property(property: "meal_type",  type: "string",  example: "lunch"),
                                    new OA\Property(property: "quantity_g", type: "number",  example: 150),
                                    new OA\Property(property: "logged_at",  type: "string",  example: "2024-01-15 12:00:00"),
                                ]
                            ),
                        ]
                    ),
                    example: [[
                        "operation"  => "create",
                        "attributes" => [
                            "user_id" => 1, "food_id" => 1,
                            "meal_type" => "lunch", "quantity_g" => 150, "logged_at" => "2024-01-15 12:00:00",
                        ]
                    ]]
                ),
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Meal logs mutated")]
    public function mealLogsMutate() {}

    #[OA\Delete(
    path: "/api/meal-logs",
    tags: ["Meal Logs"],
    summary: "Supprimer un log de repas",
    security: [["sanctum" => []]],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["resources"],
            properties: [
                new OA\Property(
                    property: "resources",
                    type: "array",
                    items: new OA\Items(type: "integer")
                )
            ]
        )
    )
    )]
    #[OA\Response(
        response: 200,
        description: "Meal log deleted"
    )]
    public function mealLogsDelete() {}

    // Sessions

    #[OA\Post(path: "/api/sessions/search", tags: ["Sessions"], summary: "Rechercher des sessions", security: [["sanctum" => []]])]
    #[OA\Response(response: 200, description: "List sessions")]
    public function sessionsSearch() {}

    #[OA\Post(path: "/api/sessions/mutate", tags: ["Sessions"], summary: "Créer / modifier des sessions", security: [["sanctum" => []]])]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: "mutate",
                    type: "array",
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: "operation", type: "string", enum: ["create", "update", "delete"], example: "create"),
                            new OA\Property(property: "key", type: "integer", example: 1, description: "Requis pour update/delete"),
                            new OA\Property(
                                property: "attributes",
                                type: "object",
                                properties: [
                                    new OA\Property(property: "user_id",      type: "integer", example: 1),
                                    new OA\Property(property: "duration_min", type: "integer", example: 45),
                                    new OA\Property(property: "performed_at",  type: "string",  example: "2024-01-15 09:00:00"),
                                ]
                            ),
                        ]
                    ),
                    example: [[
                        "operation"  => "create",
                        "attributes" => [
                            "user_id" => 1,
                            "duration_min" => 45, "performed_at" => "2024-01-15 09:00:00",
                        ]
                    ]]
                ),
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Sessions mutated")]
    public function sessionsMutate() {}

    #[OA\Delete(
    path: "/api/sessions",
    tags: ["Sessions"],
    summary: "Supprimer une session",
    security: [["sanctum" => []]],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["resources"],
            properties: [
                new OA\Property(
                    property: "resources",
                    type: "array",
                    items: new OA\Items(type: "integer")
                )
            ]
        )
    )
    )]
    #[OA\Response(
        response: 200,
        description: "Session deleted"
    )]
    public function sessionsDelete() {}

    // Users

    #[OA\Post(path: "/api/users/search", tags: ["Users"], summary: "Rechercher des utilisateurs", security: [["sanctum" => []]])]
    #[OA\Response(response: 200, description: "List users")]
    public function usersSearch() {}

    #[OA\Post(path: "/api/users/mutate", tags: ["Users"], summary: "Modifier un utilisateur", security: [["sanctum" => []]])]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: "mutate",
                    type: "array",
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: "operation", type: "string", enum: ["update"], example: "update"),
                            new OA\Property(property: "key", type: "integer", example: 1, description: "ID de l'utilisateur à modifier"),
                            new OA\Property(
                                property: "attributes",
                                type: "object",
                                properties: [
                                    new OA\Property(property: "email",      type: "string",  example: "user@example.com"),
                                    new OA\Property(property: "first_name", type: "string",  example: "Jean"),
                                    new OA\Property(property: "last_name",  type: "string",  example: "Dupont"),
                                    new OA\Property(property: "age",        type: "integer", example: 30),
                                    new OA\Property(property: "gender",     type: "string",  example: "male"),
                                    new OA\Property(property: "weight_kg",  type: "number",  example: 80),
                                    new OA\Property(property: "height_cm",  type: "number",  example: 180),
                                    new OA\Property(property: "is_premium", type: "boolean", example: false),
                                    new OA\Property(property: "is_active",  type: "boolean", example: true),
                                ]
                            ),
                        ]
                    ),
                    example: [[
                        "operation"  => "update",
                        "key"        => 1,
                        "attributes" => [
                            "first_name" => "Jean"
                        ]
                    ]]
                ),
            ]
        )
    )]
    #[OA\Response(response: 200, description: "User mutated")]
    public function usersMutate() {}

    // Metrics

    #[OA\Post(path: "/api/metrics/search", tags: ["Metrics"], summary: "Rechercher des métriques", security: [["sanctum" => []]])]
    #[OA\Response(response: 200, description: "List metrics")]
    public function metricsSearch() {}

    #[OA\Post(path: "/api/metrics/mutate", tags: ["Metrics"], summary: "Créer / modifier des métriques", security: [["sanctum" => []]])]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: "mutate",
                    type: "array",
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: "operation", type: "string", enum: ["create", "update", "delete"], example: "create"),
                            new OA\Property(property: "key", type: "integer", example: 1, description: "Requis pour update/delete"),
                            new OA\Property(
                                property: "attributes",
                                type: "object",
                                properties: [
                                    new OA\Property(property: "user_id",              type: "integer", example: 1),
                                    new OA\Property(property: "recorded_at",          type: "string",  example: "2024-01-15 08:00:00"),
                                    new OA\Property(property: "weight_kg",            type: "number",  example: 80.5),
                                    new OA\Property(property: "bmi",                  type: "number",  example: 24.8),
                                    new OA\Property(property: "body_fat_pct",         type: "number",  example: 18.5),
                                    new OA\Property(property: "heart_rate_avg",       type: "integer", example: 72),
                                    new OA\Property(property: "heart_rate_max",       type: "integer", example: 165),
                                    new OA\Property(property: "heart_rate_resting",   type: "integer", example: 58),
                                    new OA\Property(property: "calories_burned",      type: "integer", example: 450),
                                    new OA\Property(property: "session_duration_h",   type: "number",  example: 1.5),
                                    new OA\Property(property: "workout_type",         type: "string",  example: "strength"),
                                    new OA\Property(property: "workout_frequency",    type: "integer", example: 4),
                                    new OA\Property(property: "water_intake_l",       type: "number",  example: 2.5),
                                    new OA\Property(property: "experience_level",     type: "integer",  example: 1),
                                ]
                            ),
                        ]
                    ),
                    example: [[
                        "operation"  => "create",
                        "attributes" => [
                            "user_id" => 1, "recorded_at" => "2024-01-15 08:00:00",
                            "weight_kg" => 80.5, "bmi" => 24.8, "body_fat_pct" => 18.5,
                            "heart_rate_avg" => 72, "heart_rate_max" => 165, "heart_rate_resting" => 58,
                            "calories_burned" => 450, "session_duration_h" => 1.5,
                            "workout_type" => "strength", "workout_frequency" => 4,
                            "water_intake_l" => 2.5, "experience_level" => 1,
                        ]
                    ]]
                ),
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Metrics mutated")]
    public function metricsMutate() {}

    #[OA\Delete(
    path: "/api/metrics",
    tags: ["Metrics"],
    summary: "Supprimer des métriques",
    security: [["sanctum" => []]],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["resources"],
            properties: [
                new OA\Property(
                    property: "resources",
                    type: "array",
                    items: new OA\Items(type: "integer")
                )
            ]
        )
    )
    )]
    #[OA\Response(
        response: 200,
        description: "Metrics deleted"
    )]
    public function metricsDelete() {}
}
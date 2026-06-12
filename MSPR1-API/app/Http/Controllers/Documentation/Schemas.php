<?php

namespace App\Http\Controllers\Documentation;

use OpenApi\Attributes as OA;

/**
 * Schémas OpenAPI réutilisables.
 *
 * Regroupe :
 *  - les enveloppes de requête Lomkit (SearchPayload, DeletePayload) ;
 *  - les briques de recherche (SearchFilter, SearchSort, SearchInclude) ;
 *  - le format de réponse paginée (Pagination) ;
 *  - les schémas de modèles (Dish, Exercise, ...) et leurs variantes "Input"
 *    utilisées dans le corps des mutations.
 */

/* ========================================================================
 * Enveloppes & briques Lomkit
 * ===================================================================== */

#[OA\Schema(
    schema: "SearchFilter",
    title: "Filtre de recherche",
    description: "Un filtre Lomkit. Soit `field`/`operator`/`value`, soit un groupe `nested` de sous-filtres.",
    properties: [
        new OA\Property(property: "field", type: "string", example: "name", description: "Champ exposé par la ressource."),
        new OA\Property(
            property: "operator",
            type: "string",
            enum: ["=", "!=", ">", ">=", "<", "<=", "like", "not like", "in", "not in"],
            example: "like",
            description: "ATTENTION PostgreSQL : `like` est sensible à la casse."
        ),
        new OA\Property(property: "value", description: "Valeur comparée (scalaire, ou tableau pour `in`/`not in`).", example: "Squat"),
        new OA\Property(property: "type", type: "string", enum: ["and", "or"], example: "and", description: "Connecteur logique avec le filtre précédent."),
        new OA\Property(property: "nested", type: "array", items: new OA\Items(type: "object"), description: "Groupe imbriqué de filtres (exclusif avec field/operator/value)."),
    ],
    type: "object"
)]
#[OA\Schema(
    schema: "SearchSort",
    title: "Tri",
    properties: [
        new OA\Property(property: "field", type: "string", example: "id"),
        new OA\Property(property: "direction", type: "string", enum: ["asc", "desc"], example: "desc"),
    ],
    type: "object"
)]
#[OA\Schema(
    schema: "SearchInclude",
    title: "Relation à inclure",
    description: "Charge une relation. Peut elle-même contenir filtres/tris/limites imbriqués.",
    properties: [
        new OA\Property(property: "relation", type: "string", example: "user"),
        new OA\Property(property: "filters", type: "array", items: new OA\Items(ref: "#/components/schemas/SearchFilter")),
        new OA\Property(property: "sorts", type: "array", items: new OA\Items(ref: "#/components/schemas/SearchSort")),
        new OA\Property(property: "limit", type: "integer", example: 25),
    ],
    type: "object"
)]
#[OA\Schema(
    schema: "SearchPayload",
    title: "Corps de recherche Lomkit",
    description: "Toutes les clés sont optionnelles. `limit` doit valoir une des valeurs autorisées par la ressource (10, 25 ou 50).",
    properties: [
        new OA\Property(
            property: "search",
            type: "object",
            properties: [
                new OA\Property(property: "filters", type: "array", items: new OA\Items(ref: "#/components/schemas/SearchFilter")),
                new OA\Property(property: "sorts", type: "array", items: new OA\Items(ref: "#/components/schemas/SearchSort")),
                new OA\Property(property: "includes", type: "array", items: new OA\Items(ref: "#/components/schemas/SearchInclude")),
                new OA\Property(property: "scopes", type: "array", items: new OA\Items(type: "object")),
                new OA\Property(property: "aggregates", type: "array", items: new OA\Items(type: "object")),
                new OA\Property(property: "instructions", type: "array", items: new OA\Items(type: "object")),
                new OA\Property(property: "gates", type: "array", items: new OA\Items(type: "string", enum: ["viewAny", "view", "create", "update", "delete", "restore", "forceDelete"])),
                new OA\Property(property: "page", type: "integer", example: 1),
                new OA\Property(property: "limit", type: "integer", enum: [10, 25, 50], example: 25),
            ]
        ),
    ],
    type: "object",
    example: [
        "search" => [
            "filters" => [["field" => "name", "operator" => "like", "value" => "Squat"]],
            "sorts" => [["field" => "id", "direction" => "desc"]],
            "includes" => [["relation" => "user"]],
            "page" => 1,
            "limit" => 25,
        ],
    ]
)]
#[OA\Schema(
    schema: "DeletePayload",
    title: "Corps de suppression Lomkit",
    required: ["resources"],
    properties: [
        new OA\Property(property: "resources", type: "array", items: new OA\Items(type: "integer"), example: [1, 2, 3], description: "Liste des ids à supprimer."),
    ],
    type: "object"
)]
#[OA\Schema(
    schema: "Pagination",
    title: "Réponse paginée (format plat Laravel)",
    description: "La réponse de recherche est une pagination Laravel à plat (le tableau `data` contient les enregistrements).",
    properties: [
        new OA\Property(property: "current_page", type: "integer", example: 1),
        new OA\Property(property: "from", type: "integer", nullable: true, example: 1),
        new OA\Property(property: "to", type: "integer", nullable: true, example: 25),
        new OA\Property(property: "per_page", type: "integer", example: 25),
        new OA\Property(property: "last_page", type: "integer", example: 4),
        new OA\Property(property: "total", type: "integer", example: 92),
        new OA\Property(property: "first_page_url", type: "string", nullable: true),
        new OA\Property(property: "last_page_url", type: "string", nullable: true),
        new OA\Property(property: "next_page_url", type: "string", nullable: true),
        new OA\Property(property: "prev_page_url", type: "string", nullable: true),
        new OA\Property(property: "path", type: "string"),
    ],
    type: "object"
)]
#[OA\Response(
    response: "MutateResponse",
    description: "Mutation appliquée. Renvoie les clés (ids) des enregistrements créés ou modifiés.",
    content: new OA\JsonContent(properties: [
        new OA\Property(property: "created", type: "array", items: new OA\Items(type: "integer"), example: [12]),
        new OA\Property(property: "updated", type: "array", items: new OA\Items(type: "integer"), example: []),
    ])
)]

/* ========================================================================
 * Modèles
 * ===================================================================== */

#[OA\Schema(
    schema: "Dish",
    title: "Repas",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "name", type: "string", example: "Poulet grillé"),
        new OA\Property(property: "calories_kcal", type: "number", format: "float", example: 165),
        new OA\Property(property: "proteins_g", type: "number", format: "float", example: 31),
        new OA\Property(property: "carbs_g", type: "number", format: "float", example: 0),
        new OA\Property(property: "fats_g", type: "number", format: "float", example: 3.6),
        new OA\Property(property: "fiber_g", type: "number", format: "float", example: 0),
        new OA\Property(property: "sugars_g", type: "number", format: "float", example: 0),
        new OA\Property(property: "sodium_mg", type: "number", format: "float", example: 70),
        new OA\Property(property: "cholesterol_mg", type: "number", format: "float", example: 85),
        new OA\Property(property: "meal_type", type: "string", example: "lunch", description: "ex: breakfast, lunch, dinner, snack"),
        new OA\Property(property: "is_scanned", type: "boolean", example: false),
        new OA\Property(property: "user_id", type: "integer", nullable: true, example: 1),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time"),
    ],
    type: "object"
)]
#[OA\Schema(
    schema: "DishInput",
    title: "Attributs d'un repas (mutation)",
    properties: [
        new OA\Property(property: "name", type: "string", example: "Poulet grillé"),
        new OA\Property(property: "calories_kcal", type: "number", format: "float", example: 165),
        new OA\Property(property: "proteins_g", type: "number", format: "float", example: 31),
        new OA\Property(property: "carbs_g", type: "number", format: "float", example: 0),
        new OA\Property(property: "fats_g", type: "number", format: "float", example: 3.6),
        new OA\Property(property: "fiber_g", type: "number", format: "float", example: 0),
        new OA\Property(property: "sugars_g", type: "number", format: "float", example: 0),
        new OA\Property(property: "sodium_mg", type: "number", format: "float", example: 70),
        new OA\Property(property: "cholesterol_mg", type: "number", format: "float", example: 85),
        new OA\Property(property: "meal_type", type: "string", example: "lunch"),
        new OA\Property(property: "is_scanned", type: "boolean", example: false),
        new OA\Property(property: "user_id", type: "integer", example: 1),
    ],
    type: "object"
)]

#[OA\Schema(
    schema: "Exercise",
    title: "Exercice",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "name", type: "string", example: "Squat"),
        new OA\Property(property: "category", type: "string", example: "strength"),
        new OA\Property(property: "body_part", type: "string", example: "legs"),
        new OA\Property(property: "equipment", type: "string", example: "barbell"),
        new OA\Property(property: "difficulty", type: "string", example: "intermediaire"),
        new OA\Property(property: "instructions", type: "string", example: "Descendre en gardant le dos droit"),
        new OA\Property(property: "source", type: "string", example: "https://example.com"),
    ],
    type: "object"
)]
#[OA\Schema(
    schema: "ExerciseInput",
    title: "Attributs d'un exercice (mutation)",
    properties: [
        new OA\Property(property: "name", type: "string", example: "Squat"),
        new OA\Property(property: "category", type: "string", example: "strength"),
        new OA\Property(property: "body_part", type: "string", example: "legs"),
        new OA\Property(property: "equipment", type: "string", example: "barbell"),
        new OA\Property(property: "difficulty", type: "string", example: "intermediaire"),
        new OA\Property(property: "instructions", type: "string", example: "Descendre en gardant le dos droit"),
        new OA\Property(property: "source", type: "string", example: "https://example.com"),
    ],
    type: "object"
)]

#[OA\Schema(
    schema: "SportSession",
    title: "Séance de sport",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "duration_min", type: "integer", example: 45),
    ],
    type: "object"
)]
#[OA\Schema(
    schema: "SportSessionInput",
    title: "Attributs d'une séance (mutation)",
    properties: [
        new OA\Property(property: "duration_min", type: "integer", example: 45),
    ],
    type: "object"
)]

#[OA\Schema(
    schema: "Goal",
    title: "Objectif",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "name", type: "string", example: "Perte de poids"),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time"),
    ],
    type: "object"
)]
#[OA\Schema(
    schema: "GoalInput",
    title: "Attributs d'un objectif (mutation)",
    properties: [
        new OA\Property(property: "name", type: "string", example: "Perte de poids"),
    ],
    type: "object"
)]

#[OA\Schema(
    schema: "Metric",
    title: "Métrique",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "user_id", type: "integer", example: 1),
        new OA\Property(property: "recorded_at", type: "string", format: "date-time", example: "2024-01-15 08:00:00"),
        new OA\Property(property: "weight_kg", type: "number", format: "float", example: 80.5),
        new OA\Property(property: "bmi", type: "number", format: "float", example: 24.8),
        new OA\Property(property: "body_fat_pct", type: "number", format: "float", example: 18.5),
        new OA\Property(property: "heart_rate_avg", type: "integer", example: 72),
        new OA\Property(property: "heart_rate_max", type: "integer", example: 165),
        new OA\Property(property: "heart_rate_resting", type: "integer", example: 58),
        new OA\Property(property: "calories_burned", type: "integer", example: 450),
        new OA\Property(property: "session_duration_h", type: "number", format: "float", example: 1.5),
        new OA\Property(property: "workout_type", type: "string", example: "strength"),
        new OA\Property(property: "workout_frequency", type: "integer", example: 4),
        new OA\Property(property: "water_intake_l", type: "number", format: "float", example: 2.5),
        new OA\Property(property: "experience_level", type: "integer", example: 1),
    ],
    type: "object"
)]
#[OA\Schema(
    schema: "MetricInput",
    title: "Attributs d'une métrique (mutation)",
    properties: [
        new OA\Property(property: "user_id", type: "integer", example: 1),
        new OA\Property(property: "recorded_at", type: "string", format: "date-time", example: "2024-01-15 08:00:00"),
        new OA\Property(property: "weight_kg", type: "number", format: "float", example: 80.5),
        new OA\Property(property: "bmi", type: "number", format: "float", example: 24.8),
        new OA\Property(property: "body_fat_pct", type: "number", format: "float", example: 18.5),
        new OA\Property(property: "heart_rate_avg", type: "integer", example: 72),
        new OA\Property(property: "heart_rate_max", type: "integer", example: 165),
        new OA\Property(property: "heart_rate_resting", type: "integer", example: 58),
        new OA\Property(property: "calories_burned", type: "integer", example: 450),
        new OA\Property(property: "session_duration_h", type: "number", format: "float", example: 1.5),
        new OA\Property(property: "workout_type", type: "string", example: "strength"),
        new OA\Property(property: "workout_frequency", type: "integer", example: 4),
        new OA\Property(property: "water_intake_l", type: "number", format: "float", example: 2.5),
        new OA\Property(property: "experience_level", type: "integer", example: 1),
    ],
    type: "object"
)]

#[OA\Schema(
    schema: "User",
    title: "Utilisateur",
    description: "Les champs `password` et `remember_token` ne sont jamais renvoyés (masqués par le modèle).",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "email", type: "string", format: "email", example: "user@example.com"),
        new OA\Property(property: "first_name", type: "string", example: "Jean"),
        new OA\Property(property: "last_name", type: "string", example: "Dupont"),
        new OA\Property(property: "age", type: "integer", example: 30),
        new OA\Property(property: "gender", type: "string", enum: ["male", "female", "other"], example: "male"),
        new OA\Property(property: "weight_kg", type: "number", format: "float", example: 80),
        new OA\Property(property: "height_cm", type: "number", format: "float", example: 180),
        new OA\Property(property: "is_premium", type: "boolean", example: false),
        new OA\Property(property: "is_active", type: "boolean", example: true),
    ],
    type: "object"
)]
class Schemas
{
}

<?php

namespace App\Http\Controllers\Documentation;

use OpenApi\Attributes as OA;

/**
 * Documentation OpenAPI de l'API MSPR1.
 *
 * Cette API expose deux familles d'endpoints :
 *  - Les endpoints d'authentification (hors Lomkit) : login / register / logout / me.
 *  - Les ressources REST gérées par le package **lomkit/laravel-rest-api**.
 *
 * --------------------------------------------------------------------------
 * Convention Lomkit REST API
 * --------------------------------------------------------------------------
 * Chaque `Rest::resource('xxx', ...)` enregistre les routes suivantes
 * (toutes protégées par `auth:sanctum`) :
 *
 *   GET    /api/{ressource}          -> "details"  : schéma/description de la ressource
 *   POST   /api/{ressource}/search   -> "search"   : recherche paginée (filtres, tris, includes...)
 *   POST   /api/{ressource}/mutate   -> "mutate"   : création / mise à jour (+ relations)
 *   DELETE /api/{ressource}          -> "destroy"  : suppression par liste d'ids
 *
 * Il n'existe PAS de route REST classique `GET /api/{ressource}/{id}`.
 * La lecture d'un enregistrement se fait via `POST /search` avec un filtre sur l'`id`.
 *
 * Le corps des requêtes search/mutate/destroy est toujours enveloppé dans une
 * clé racine (`search`, `mutate`, `resources`). Voir les schémas réutilisables
 * `SearchPayload`, `MutatePayload` et `DeletePayload`.
 */
#[OA\Info(
    title: "MSPR1 API",
    version: "1.0.0",
    description: <<<DESC
API de suivi sportif et nutritionnel (exercices, repas, séances, métriques).

**Authentification** : Sanctum (Bearer token). Récupérez un token via `POST /api/login`,
puis cliquez sur **Authorize** et saisissez le token (il sera envoyé en `Authorization: Bearer <token>`).

**Ressources REST** : gérées par lomkit/laravel-rest-api. Les opérations de lecture
se font via `POST /{ressource}/search`, les écritures via `POST /{ressource}/mutate`,
les suppressions via `DELETE /{ressource}`.

**Note filtres** : la base de données est en PostgreSQL. L'opérateur `like` y est
**sensible à la casse** ; pensez à respecter la casse exacte du terme recherché.
DESC
)]
#[OA\Server(url: "/", description: "Serveur courant")]
#[OA\Server(url: "https://mspr2-api-production.up.railway.app", description: "Production (Railway)")]
#[OA\SecurityScheme(
    securityScheme: "sanctum",
    type: "http",
    scheme: "bearer",
    bearerFormat: "Sanctum",
    description: "Token personnel Sanctum renvoyé par /api/login"
)]
#[OA\Tag(name: "Auth", description: "Inscription, connexion, déconnexion, profil courant")]
#[OA\Tag(name: "Dishes", description: "Repas / aliments enregistrés (table dishes)")]
#[OA\Tag(name: "Exercises", description: "Catalogue d'exercices")]
#[OA\Tag(name: "Sport Sessions", description: "Séances de sport (liées aux exercices, utilisateurs et objectifs)")]
#[OA\Tag(name: "Goals", description: "Objectifs")]
#[OA\Tag(name: "Metrics", description: "Mesures physiologiques d'un utilisateur")]
#[OA\Tag(name: "Users", description: "Utilisateurs (recherche uniquement)")]
class ApiDocumentation
{
    // ======================================================================
    // AUTH
    // ======================================================================

    #[OA\Post(
        path: "/api/register",
        tags: ["Auth"],
        summary: "Inscription d'un nouvel utilisateur",
        description: "Crée un compte et lui assigne le rôle `Administrator`. Ne renvoie pas de token : utilisez ensuite `/api/login`.",
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["email", "password"],
                properties: [
                    new OA\Property(property: "email", type: "string", format: "email", example: "user@example.com"),
                    new OA\Property(property: "password", type: "string", format: "password", example: "password"),
                    new OA\Property(property: "first_name", type: "string", example: "Jean"),
                    new OA\Property(property: "last_name", type: "string", example: "Dupont"),
                    new OA\Property(property: "age", type: "integer", example: 30),
                    new OA\Property(property: "gender", type: "string", enum: ["male", "female", "other"], example: "male"),
                    new OA\Property(property: "weight_kg", type: "number", format: "float", example: 80),
                    new OA\Property(property: "height_cm", type: "number", format: "float", example: 180),
                ]
            )
        )
    )]
    #[OA\Response(
        response: 200,
        description: "Utilisateur créé",
        content: new OA\JsonContent(properties: [
            new OA\Property(property: "message", type: "string", example: "ok"),
        ])
    )]
    public function register() {}

    #[OA\Post(
        path: "/api/login",
        tags: ["Auth"],
        summary: "Connexion utilisateur",
        description: "Renvoie un token Bearer Sanctum à utiliser pour les requêtes authentifiées.",
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["email", "password"],
                properties: [
                    new OA\Property(property: "email", type: "string", format: "email", example: "user@example.com"),
                    new OA\Property(property: "password", type: "string", format: "password", example: "password"),
                ]
            )
        )
    )]
    #[OA\Response(
        response: 200,
        description: "Connexion réussie",
        content: new OA\JsonContent(properties: [
            new OA\Property(property: "bearer_token", type: "string", example: "1|abcdef0123456789..."),
        ])
    )]
    #[OA\Response(
        response: 403,
        description: "Identifiants invalides",
        content: new OA\JsonContent(type: "string", example: "Invalid credentials")
    )]
    public function login() {}

    #[OA\Post(
        path: "/api/logout",
        tags: ["Auth"],
        summary: "Déconnexion",
        description: "Révoque le token courant.",
        security: [["sanctum" => []]]
    )]
    #[OA\Response(
        response: 200,
        description: "Déconnecté",
        content: new OA\JsonContent(properties: [
            new OA\Property(property: "message", type: "string", example: "Logged out"),
        ])
    )]
    #[OA\Response(response: 401, description: "Non authentifié")]
    public function logout() {}

    #[OA\Get(
        path: "/api/me",
        tags: ["Auth"],
        summary: "Profil de l'utilisateur connecté",
        security: [["sanctum" => []]]
    )]
    #[OA\Response(
        response: 200,
        description: "Utilisateur courant",
        content: new OA\JsonContent(ref: "#/components/schemas/User")
    )]
    #[OA\Response(response: 401, description: "Non authentifié")]
    public function me() {}

    // ======================================================================
    // DISHES
    // ======================================================================

    #[OA\Get(
        path: "/api/dishes",
        tags: ["Dishes"],
        summary: "Détails de la ressource Dishes",
        description: "Renvoie la description Lomkit de la ressource (champs, relations, scopes, limites disponibles).",
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Description de la ressource")]
    public function dishesDetails() {}

    #[OA\Post(
        path: "/api/dishes/search",
        tags: ["Dishes"],
        summary: "Rechercher des repas",
        description: "Champs filtrables/triables : id, name, calories_kcal, proteins_g, carbs_g, fats_g, fiber_g, sugars_g, sodium_mg, cholesterol_mg, meal_type, is_scanned, user_id, created_at, updated_at. Relation incluable : `user`.",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/SearchPayload"))
    )]
    #[OA\Response(
        response: 200,
        description: "Repas paginés",
        content: new OA\JsonContent(
            allOf: [
                new OA\Schema(ref: "#/components/schemas/Pagination"),
                new OA\Schema(properties: [
                    new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Dish")),
                ]),
            ]
        )
    )]
    public function dishesSearch() {}

    #[OA\Post(
        path: "/api/dishes/mutate",
        tags: ["Dishes"],
        summary: "Créer / modifier des repas",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["mutate"],
                properties: [
                    new OA\Property(
                        property: "mutate",
                        type: "array",
                        items: new OA\Items(
                            required: ["operation"],
                            properties: [
                                new OA\Property(property: "operation", type: "string", enum: ["create", "update"], example: "create"),
                                new OA\Property(property: "key", type: "integer", example: 1, description: "ID ciblé. Requis pour `update`."),
                                new OA\Property(property: "attributes", ref: "#/components/schemas/DishInput"),
                            ]
                        )
                    ),
                ]
            )
        )
    )]
    #[OA\Response(response: 200, ref: "#/components/responses/MutateResponse")]
    public function dishesMutate() {}

    #[OA\Delete(
        path: "/api/dishes",
        tags: ["Dishes"],
        summary: "Supprimer des repas",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/DeletePayload"))
    )]
    #[OA\Response(response: 200, description: "Repas supprimés")]
    public function dishesDelete() {}

    // ======================================================================
    // EXERCISES
    // ======================================================================

    #[OA\Get(
        path: "/api/exercises",
        tags: ["Exercises"],
        summary: "Détails de la ressource Exercises",
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Description de la ressource")]
    public function exercisesDetails() {}

    #[OA\Post(
        path: "/api/exercises/search",
        tags: ["Exercises"],
        summary: "Rechercher des exercices",
        description: "Champs filtrables/triables : id, name, category, body_part, equipment, difficulty, instructions, source. Relation incluable : `sportSessions` (pivot reps, sets, duration_min).",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/SearchPayload"))
    )]
    #[OA\Response(
        response: 200,
        description: "Exercices paginés",
        content: new OA\JsonContent(
            allOf: [
                new OA\Schema(ref: "#/components/schemas/Pagination"),
                new OA\Schema(properties: [
                    new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Exercise")),
                ]),
            ]
        )
    )]
    public function exercisesSearch() {}

    #[OA\Post(
        path: "/api/exercises/mutate",
        tags: ["Exercises"],
        summary: "Créer / modifier des exercices",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["mutate"],
                properties: [
                    new OA\Property(
                        property: "mutate",
                        type: "array",
                        items: new OA\Items(
                            required: ["operation"],
                            properties: [
                                new OA\Property(property: "operation", type: "string", enum: ["create", "update"], example: "create"),
                                new OA\Property(property: "key", type: "integer", example: 1, description: "ID ciblé. Requis pour `update`."),
                                new OA\Property(property: "attributes", ref: "#/components/schemas/ExerciseInput"),
                            ]
                        )
                    ),
                ]
            )
        )
    )]
    #[OA\Response(response: 200, ref: "#/components/responses/MutateResponse")]
    public function exercisesMutate() {}

    #[OA\Delete(
        path: "/api/exercises",
        tags: ["Exercises"],
        summary: "Supprimer des exercices",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/DeletePayload"))
    )]
    #[OA\Response(response: 200, description: "Exercices supprimés")]
    public function exercisesDelete() {}

    // ======================================================================
    // SPORT SESSIONS
    // ======================================================================

    #[OA\Get(
        path: "/api/sport_sessions",
        tags: ["Sport Sessions"],
        summary: "Détails de la ressource Sport Sessions",
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Description de la ressource")]
    public function sportSessionsDetails() {}

    #[OA\Post(
        path: "/api/sport_sessions/search",
        tags: ["Sport Sessions"],
        summary: "Rechercher des séances",
        description: "Champs filtrables/triables : id, duration_min. Relations incluables : `users` (pivot performed_at), `exercises` (pivot reps, sets, duration_min), `goals`.",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/SearchPayload"))
    )]
    #[OA\Response(
        response: 200,
        description: "Séances paginées",
        content: new OA\JsonContent(
            allOf: [
                new OA\Schema(ref: "#/components/schemas/Pagination"),
                new OA\Schema(properties: [
                    new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/SportSession")),
                ]),
            ]
        )
    )]
    public function sportSessionsSearch() {}

    #[OA\Post(
        path: "/api/sport_sessions/mutate",
        tags: ["Sport Sessions"],
        summary: "Créer / modifier des séances",
        description: "Une séance se compose d'une durée et de relations attachées (exercices, utilisateurs, objectifs). Les relations many-to-many se manipulent via les opérations `attach`, `detach`, `toggle`, `sync`.",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["mutate"],
                properties: [
                    new OA\Property(
                        property: "mutate",
                        type: "array",
                        items: new OA\Items(
                            required: ["operation"],
                            properties: [
                                new OA\Property(property: "operation", type: "string", enum: ["create", "update"], example: "create"),
                                new OA\Property(property: "key", type: "integer", example: 1, description: "ID ciblé. Requis pour `update`."),
                                new OA\Property(property: "attributes", ref: "#/components/schemas/SportSessionInput"),
                                new OA\Property(
                                    property: "relations",
                                    type: "object",
                                    description: "Relations à attacher/synchroniser.",
                                    properties: [
                                        new OA\Property(property: "exercises", type: "array", items: new OA\Items(
                                            properties: [
                                                new OA\Property(property: "operation", type: "string", enum: ["attach", "detach", "toggle", "sync"], example: "attach"),
                                                new OA\Property(property: "key", type: "integer", example: 1),
                                                new OA\Property(property: "attributes", type: "object", description: "Champs pivot", properties: [
                                                    new OA\Property(property: "reps", type: "integer", example: 10),
                                                    new OA\Property(property: "sets", type: "integer", example: 3),
                                                    new OA\Property(property: "duration_min", type: "integer", example: 15),
                                                ]),
                                            ]
                                        )),
                                        new OA\Property(property: "users", type: "array", items: new OA\Items(
                                            properties: [
                                                new OA\Property(property: "operation", type: "string", enum: ["attach", "detach", "toggle", "sync"], example: "attach"),
                                                new OA\Property(property: "key", type: "integer", example: 1),
                                                new OA\Property(property: "attributes", type: "object", properties: [
                                                    new OA\Property(property: "performed_at", type: "string", format: "date-time", example: "2024-01-15 09:00:00"),
                                                ]),
                                            ]
                                        )),
                                        new OA\Property(property: "goals", type: "array", items: new OA\Items(
                                            properties: [
                                                new OA\Property(property: "operation", type: "string", enum: ["attach", "detach", "toggle", "sync"], example: "attach"),
                                                new OA\Property(property: "key", type: "integer", example: 1),
                                            ]
                                        )),
                                    ]
                                ),
                            ]
                        ),
                        example: [[
                            "operation" => "create",
                            "attributes" => ["duration_min" => 45],
                            "relations" => [
                                "exercises" => [["operation" => "attach", "key" => 1, "attributes" => ["reps" => 10, "sets" => 3, "duration_min" => 15]]],
                                "users" => [["operation" => "attach", "key" => 1, "attributes" => ["performed_at" => "2024-01-15 09:00:00"]]],
                                "goals" => [["operation" => "attach", "key" => 1]],
                            ],
                        ]]
                    ),
                ]
            )
        )
    )]
    #[OA\Response(response: 200, ref: "#/components/responses/MutateResponse")]
    public function sportSessionsMutate() {}

    #[OA\Delete(
        path: "/api/sport_sessions",
        tags: ["Sport Sessions"],
        summary: "Supprimer des séances",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/DeletePayload"))
    )]
    #[OA\Response(response: 200, description: "Séances supprimées")]
    public function sportSessionsDelete() {}

    // ======================================================================
    // GOALS
    // ======================================================================

    #[OA\Get(
        path: "/api/goals",
        tags: ["Goals"],
        summary: "Détails de la ressource Goals",
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Description de la ressource")]
    public function goalsDetails() {}

    #[OA\Post(
        path: "/api/goals/search",
        tags: ["Goals"],
        summary: "Rechercher des objectifs",
        description: "Champs filtrables/triables : id, name, created_at, updated_at. Relations incluables : `users`, `sportSessions`.",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/SearchPayload"))
    )]
    #[OA\Response(
        response: 200,
        description: "Objectifs paginés",
        content: new OA\JsonContent(
            allOf: [
                new OA\Schema(ref: "#/components/schemas/Pagination"),
                new OA\Schema(properties: [
                    new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Goal")),
                ]),
            ]
        )
    )]
    public function goalsSearch() {}

    #[OA\Post(
        path: "/api/goals/mutate",
        tags: ["Goals"],
        summary: "Créer / modifier des objectifs",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["mutate"],
                properties: [
                    new OA\Property(
                        property: "mutate",
                        type: "array",
                        items: new OA\Items(
                            required: ["operation"],
                            properties: [
                                new OA\Property(property: "operation", type: "string", enum: ["create", "update"], example: "create"),
                                new OA\Property(property: "key", type: "integer", example: 1, description: "ID ciblé. Requis pour `update`."),
                                new OA\Property(property: "attributes", ref: "#/components/schemas/GoalInput"),
                            ]
                        )
                    ),
                ]
            )
        )
    )]
    #[OA\Response(response: 200, ref: "#/components/responses/MutateResponse")]
    public function goalsMutate() {}

    #[OA\Delete(
        path: "/api/goals",
        tags: ["Goals"],
        summary: "Supprimer des objectifs",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/DeletePayload"))
    )]
    #[OA\Response(response: 200, description: "Objectifs supprimés")]
    public function goalsDelete() {}

    // ======================================================================
    // METRICS
    // ======================================================================

    #[OA\Get(
        path: "/api/metrics",
        tags: ["Metrics"],
        summary: "Détails de la ressource Metrics",
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Description de la ressource")]
    public function metricsDetails() {}

    #[OA\Post(
        path: "/api/metrics/search",
        tags: ["Metrics"],
        summary: "Rechercher des métriques",
        description: "Champs filtrables/triables : id, user_id, recorded_at, weight_kg, bmi, body_fat_pct, heart_rate_avg, heart_rate_max, heart_rate_resting, calories_burned, session_duration_h, workout_type, workout_frequency, water_intake_l, experience_level. Relation incluable : `user`.",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/SearchPayload"))
    )]
    #[OA\Response(
        response: 200,
        description: "Métriques paginées",
        content: new OA\JsonContent(
            allOf: [
                new OA\Schema(ref: "#/components/schemas/Pagination"),
                new OA\Schema(properties: [
                    new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Metric")),
                ]),
            ]
        )
    )]
    public function metricsSearch() {}

    #[OA\Post(
        path: "/api/metrics/mutate",
        tags: ["Metrics"],
        summary: "Créer / modifier des métriques",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["mutate"],
                properties: [
                    new OA\Property(
                        property: "mutate",
                        type: "array",
                        items: new OA\Items(
                            required: ["operation"],
                            properties: [
                                new OA\Property(property: "operation", type: "string", enum: ["create", "update"], example: "create"),
                                new OA\Property(property: "key", type: "integer", example: 1, description: "ID ciblé. Requis pour `update`."),
                                new OA\Property(property: "attributes", ref: "#/components/schemas/MetricInput"),
                            ]
                        )
                    ),
                ]
            )
        )
    )]
    #[OA\Response(response: 200, ref: "#/components/responses/MutateResponse")]
    public function metricsMutate() {}

    #[OA\Delete(
        path: "/api/metrics",
        tags: ["Metrics"],
        summary: "Supprimer des métriques",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/DeletePayload"))
    )]
    #[OA\Response(response: 200, description: "Métriques supprimées")]
    public function metricsDelete() {}

    // ======================================================================
    // USERS (recherche uniquement)
    // ======================================================================

    #[OA\Post(
        path: "/api/users/search",
        tags: ["Users"],
        summary: "Rechercher des utilisateurs",
        description: "Seule l'opération `search` est exposée pour les utilisateurs. Champs filtrables/triables : id, email, first_name, last_name, age, gender, weight_kg, height_cm, is_premium, is_active. Relations incluables : `sportSessions`, `metrics`.",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/SearchPayload"))
    )]
    #[OA\Response(
        response: 200,
        description: "Utilisateurs paginés",
        content: new OA\JsonContent(
            allOf: [
                new OA\Schema(ref: "#/components/schemas/Pagination"),
                new OA\Schema(properties: [
                    new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/User")),
                ]),
            ]
        )
    )]
    public function usersSearch() {}
}

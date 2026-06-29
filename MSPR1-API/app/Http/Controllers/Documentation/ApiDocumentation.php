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
#[OA\Tag(name: "Posts", description: "Réseau social : publications du fil (avec likes et médias)")]
#[OA\Tag(name: "Comments", description: "Réseau social : commentaires de posts (avec likes)")]
#[OA\Tag(name: "Allergies", description: "Catalogue d'allergies (rattachables aux utilisateurs)")]
#[OA\Tag(name: "Handicaps", description: "Catalogue de handicaps (rattachables aux utilisateurs)")]
#[OA\Tag(name: "Logs", description: "Journal des requêtes API (recherche, mutation, suppression)")]
#[OA\Tag(name: "Profile", description: "Gestion du compte courant : profil, séances suivies, suivi santé")]
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
        description: "Une séance se compose d'une durée et de relations attachées (exercices, utilisateurs, objectifs). Les relations many-to-many se manipulent via les opérations `attach`, `detach`, `toggle`, `sync`. IMPORTANT : pour une relation, `attributes` est INTERDIT avec `attach`/`detach` ; les champs de table pivot se passent sous la clé `pivot`. Seule la relation `exercises` expose des champs pivot (reps, sets, duration_min) ; `users` et `goals` n'acceptent que `operation` + `key`.",
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
                                                new OA\Property(property: "pivot", type: "object", description: "Champs de table pivot (clé `pivot`, pas `attributes`).", properties: [
                                                    new OA\Property(property: "reps", type: "integer", example: 10),
                                                    new OA\Property(property: "sets", type: "integer", example: 3),
                                                    new OA\Property(property: "duration_min", type: "integer", example: 15),
                                                ]),
                                            ]
                                        )),
                                        new OA\Property(property: "users", type: "array", items: new OA\Items(
                                            description: "Aucun champ pivot exposé : fournir uniquement `operation` et `key`.",
                                            properties: [
                                                new OA\Property(property: "operation", type: "string", enum: ["attach", "detach", "toggle", "sync"], example: "attach"),
                                                new OA\Property(property: "key", type: "integer", example: 1),
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
                                "exercises" => [["operation" => "attach", "key" => 1, "pivot" => ["reps" => 10, "sets" => 3, "duration_min" => 15]]],
                                "users" => [["operation" => "attach", "key" => 1]],
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

    // ======================================================================
    // POSTS (réseau social)
    // ======================================================================

    #[OA\Get(
        path: "/api/posts",
        tags: ["Posts"],
        summary: "Détails de la ressource Posts",
        description: "Renvoie la description Lomkit de la ressource (champs, relations, limites).",
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Description de la ressource")]
    public function postsDetails() {}

    #[OA\Post(
        path: "/api/posts/search",
        tags: ["Posts"],
        summary: "Rechercher des posts",
        description: "Champs filtrables/triables : id, content, user_id, created_at, updated_at. Champs calculés renvoyés : `likes`, `hasLiked`. Relations incluables : `user`, `comments`, `likers`, `medias`.",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/SearchPayload"))
    )]
    #[OA\Response(
        response: 200,
        description: "Posts paginés",
        content: new OA\JsonContent(
            allOf: [
                new OA\Schema(ref: "#/components/schemas/Pagination"),
                new OA\Schema(properties: [
                    new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Post")),
                ]),
            ]
        )
    )]
    public function postsSearch() {}

    #[OA\Post(
        path: "/api/posts/mutate",
        tags: ["Posts"],
        summary: "Créer / modifier des posts (+ likes, médias)",
        description: <<<DESC
Création/mise à jour d'un post. Les **likes** se gèrent via la relation `likers` (opérations `attach`/`detach`/`toggle`/`sync` avec la `key` de l'utilisateur).

**Upload d'images** : ajouter une clé racine `medias` (au même niveau que `mutate`, PAS sous `attributes`). Chaque entrée a une `collection` (`post_media`) et un `file`. Comme un fichier est envoyé, la requête doit être en `multipart/form-data` : `mutate` est alors une chaîne JSON, et les fichiers sont passés en `medias[0][file]`, `medias[0][collection]`, etc.
DESC,
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\JsonContent(
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
                                    new OA\Property(property: "attributes", ref: "#/components/schemas/PostInput"),
                                    new OA\Property(
                                        property: "relations",
                                        type: "object",
                                        description: "Relations. `likers` gère les likes.",
                                        properties: [
                                            new OA\Property(property: "likers", type: "array", items: new OA\Items(
                                                description: "Like/unlike : fournir `operation` et `key` (id utilisateur).",
                                                properties: [
                                                    new OA\Property(property: "operation", type: "string", enum: ["attach", "detach", "toggle", "sync"], example: "toggle"),
                                                    new OA\Property(property: "key", type: "integer", example: 1),
                                                ]
                                            )),
                                            new OA\Property(property: "comments", type: "array", items: new OA\Items(type: "object")),
                                        ]
                                    ),
                                ]
                            ),
                            example: [[
                                "operation" => "create",
                                "attributes" => ["content" => ["text" => "Première séance de la semaine !"], "user_id" => 1],
                                "relations" => ["likers" => [["operation" => "attach", "key" => 1]]],
                            ]]
                        ),
                    ]
                ),
                new OA\MediaType(
                    mediaType: "multipart/form-data",
                    schema: new OA\Schema(
                        required: ["mutate"],
                        properties: [
                            new OA\Property(property: "mutate", type: "string", description: "Tableau `mutate` encodé en JSON.", example: '[{"operation":"create","attributes":{"content":{"text":"Hello"},"user_id":1}}]'),
                            new OA\Property(
                                property: "medias",
                                type: "array",
                                items: new OA\Items(ref: "#/components/schemas/MediaUpload"),
                                description: "Images à attacher (collection `post_media`)."
                            ),
                        ]
                    )
                ),
            ]
        )
    )]
    #[OA\Response(response: 200, ref: "#/components/responses/MutateResponse")]
    public function postsMutate() {}

    #[OA\Delete(
        path: "/api/posts",
        tags: ["Posts"],
        summary: "Supprimer des posts",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/DeletePayload"))
    )]
    #[OA\Response(response: 200, description: "Posts supprimés")]
    public function postsDelete() {}

    // ======================================================================
    // COMMENTS (réseau social)
    // ======================================================================

    #[OA\Get(
        path: "/api/comments",
        tags: ["Comments"],
        summary: "Détails de la ressource Comments",
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Description de la ressource")]
    public function commentsDetails() {}

    #[OA\Post(
        path: "/api/comments/search",
        tags: ["Comments"],
        summary: "Rechercher des commentaires",
        description: "Champs filtrables/triables : id, content, user_id, post_id, created_at, updated_at. Champs calculés : `likes`, `hasLiked`. Relations incluables : `user`, `post`, `likers`.",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/SearchPayload"))
    )]
    #[OA\Response(
        response: 200,
        description: "Commentaires paginés",
        content: new OA\JsonContent(
            allOf: [
                new OA\Schema(ref: "#/components/schemas/Pagination"),
                new OA\Schema(properties: [
                    new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Comment")),
                ]),
            ]
        )
    )]
    public function commentsSearch() {}

    #[OA\Post(
        path: "/api/comments/mutate",
        tags: ["Comments"],
        summary: "Créer / modifier des commentaires (+ likes)",
        description: "Création/mise à jour d'un commentaire. Rattacher le commentaire à un post via `attributes.post_id`. Les **likes** se gèrent via la relation `likers` (`attach`/`detach`/`toggle`/`sync` avec la `key` de l'utilisateur).",
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
                                new OA\Property(property: "attributes", ref: "#/components/schemas/CommentInput"),
                                new OA\Property(
                                    property: "relations",
                                    type: "object",
                                    properties: [
                                        new OA\Property(property: "likers", type: "array", items: new OA\Items(
                                            properties: [
                                                new OA\Property(property: "operation", type: "string", enum: ["attach", "detach", "toggle", "sync"], example: "toggle"),
                                                new OA\Property(property: "key", type: "integer", example: 1),
                                            ]
                                        )),
                                    ]
                                ),
                            ]
                        ),
                        example: [[
                            "operation" => "create",
                            "attributes" => ["content" => ["text" => "Bravo !"], "user_id" => 1, "post_id" => 1],
                        ]]
                    ),
                ]
            )
        )
    )]
    #[OA\Response(response: 200, ref: "#/components/responses/MutateResponse")]
    public function commentsMutate() {}

    #[OA\Delete(
        path: "/api/comments",
        tags: ["Comments"],
        summary: "Supprimer des commentaires",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/DeletePayload"))
    )]
    #[OA\Response(response: 200, description: "Commentaires supprimés")]
    public function commentsDelete() {}

    // ======================================================================
    // ALLERGIES
    // ======================================================================

    #[OA\Get(
        path: "/api/allergies",
        tags: ["Allergies"],
        summary: "Détails de la ressource Allergies",
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Description de la ressource")]
    public function allergiesDetails() {}

    #[OA\Post(
        path: "/api/allergies/search",
        tags: ["Allergies"],
        summary: "Rechercher des allergies",
        description: "Champs filtrables/triables : id, name, label. Relation incluable : `users`.",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/SearchPayload"))
    )]
    #[OA\Response(
        response: 200,
        description: "Allergies paginées",
        content: new OA\JsonContent(
            allOf: [
                new OA\Schema(ref: "#/components/schemas/Pagination"),
                new OA\Schema(properties: [
                    new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Allergy")),
                ]),
            ]
        )
    )]
    public function allergiesSearch() {}

    #[OA\Post(
        path: "/api/allergies/mutate",
        tags: ["Allergies"],
        summary: "Créer / modifier des allergies",
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
                                new OA\Property(property: "attributes", ref: "#/components/schemas/AllergyInput"),
                            ]
                        )
                    ),
                ]
            )
        )
    )]
    #[OA\Response(response: 200, ref: "#/components/responses/MutateResponse")]
    public function allergiesMutate() {}

    #[OA\Delete(
        path: "/api/allergies",
        tags: ["Allergies"],
        summary: "Supprimer des allergies",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/DeletePayload"))
    )]
    #[OA\Response(response: 200, description: "Allergies supprimées")]
    public function allergiesDelete() {}

    // ======================================================================
    // HANDICAPS
    // ======================================================================

    #[OA\Get(
        path: "/api/handicaps",
        tags: ["Handicaps"],
        summary: "Détails de la ressource Handicaps",
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Description de la ressource")]
    public function handicapsDetails() {}

    #[OA\Post(
        path: "/api/handicaps/search",
        tags: ["Handicaps"],
        summary: "Rechercher des handicaps",
        description: "Champs filtrables/triables : id, name, label. Relation incluable : `users`.",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/SearchPayload"))
    )]
    #[OA\Response(
        response: 200,
        description: "Handicaps paginés",
        content: new OA\JsonContent(
            allOf: [
                new OA\Schema(ref: "#/components/schemas/Pagination"),
                new OA\Schema(properties: [
                    new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Handicap")),
                ]),
            ]
        )
    )]
    public function handicapsSearch() {}

    #[OA\Post(
        path: "/api/handicaps/mutate",
        tags: ["Handicaps"],
        summary: "Créer / modifier des handicaps",
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
                                new OA\Property(property: "attributes", ref: "#/components/schemas/HandicapInput"),
                            ]
                        )
                    ),
                ]
            )
        )
    )]
    #[OA\Response(response: 200, ref: "#/components/responses/MutateResponse")]
    public function handicapsMutate() {}

    #[OA\Delete(
        path: "/api/handicaps",
        tags: ["Handicaps"],
        summary: "Supprimer des handicaps",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/DeletePayload"))
    )]
    #[OA\Response(response: 200, description: "Handicaps supprimés")]
    public function handicapsDelete() {}

    // ======================================================================
    // LOGS (search / mutate / destroy uniquement)
    // ======================================================================

    #[OA\Post(
        path: "/api/logs/search",
        tags: ["Logs"],
        summary: "Rechercher des logs",
        description: "Champs filtrables/triables : id, api_name, data, type, ip, created_at, updated_at. Aucune relation. (Pas de route `details`.)",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(ref: "#/components/schemas/SearchPayload"))
    )]
    #[OA\Response(
        response: 200,
        description: "Logs paginés",
        content: new OA\JsonContent(
            allOf: [
                new OA\Schema(ref: "#/components/schemas/Pagination"),
                new OA\Schema(properties: [
                    new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Log")),
                ]),
            ]
        )
    )]
    public function logsSearch() {}

    #[OA\Post(
        path: "/api/logs/mutate",
        tags: ["Logs"],
        summary: "Créer / modifier des logs",
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
                                new OA\Property(property: "key", type: "string", example: "9b1f...", description: "UUID ciblé. Requis pour `update`."),
                                new OA\Property(property: "attributes", ref: "#/components/schemas/LogInput"),
                            ]
                        )
                    ),
                ]
            )
        )
    )]
    #[OA\Response(response: 200, ref: "#/components/responses/MutateResponse")]
    public function logsMutate() {}

    #[OA\Delete(
        path: "/api/logs",
        tags: ["Logs"],
        summary: "Supprimer des logs",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(content: new OA\JsonContent(
            required: ["resources"],
            properties: [
                new OA\Property(property: "resources", type: "array", items: new OA\Items(type: "string"), example: ["9b1f...", "9b20..."], description: "Liste des UUID à supprimer."),
            ],
            type: "object"
        ))
    )]
    #[OA\Response(response: 200, description: "Logs supprimés")]
    public function logsDelete() {}

    // ======================================================================
    // PROFILE (compte courant : me, séances, suivi santé)
    // ======================================================================

    #[OA\Patch(
        path: "/api/me",
        tags: ["Profile"],
        summary: "Mettre à jour son profil",
        description: "Met à jour le compte de l'utilisateur connecté. Les listes `allergies`/`handicaps` (ids) sont synchronisées sur les relations correspondantes.",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(properties: [
                new OA\Property(property: "email", type: "string", format: "email", example: "user@example.com"),
                new OA\Property(property: "password", type: "string", format: "password", example: "newpassword"),
                new OA\Property(property: "first_name", type: "string", nullable: true, example: "Jean"),
                new OA\Property(property: "last_name", type: "string", nullable: true, example: "Dupont"),
                new OA\Property(property: "age", type: "integer", nullable: true, example: 30),
                new OA\Property(property: "gender", type: "string", enum: ["male", "female", "other"], nullable: true, example: "male"),
                new OA\Property(property: "weight_kg", type: "number", format: "float", nullable: true, example: 80),
                new OA\Property(property: "height_cm", type: "number", format: "float", nullable: true, example: 180),
                new OA\Property(property: "bodyfat", type: "number", format: "float", nullable: true, example: 18.5),
                new OA\Property(property: "rest_bpm", type: "integer", nullable: true, example: 58),
                new OA\Property(property: "sport_per_week", type: "number", format: "float", nullable: true, example: 3),
                new OA\Property(property: "goal_id", type: "integer", nullable: true, example: 1),
                new OA\Property(property: "target_weight", type: "number", format: "float", nullable: true, example: 75),
                new OA\Property(property: "weeks_to_goal", type: "integer", nullable: true, example: 12, description: "Entre 1 et 104."),
                new OA\Property(property: "allergies", type: "array", items: new OA\Items(type: "integer"), example: [1, 2], description: "Ids d'allergies à synchroniser."),
                new OA\Property(property: "handicaps", type: "array", items: new OA\Items(type: "integer"), example: [3], description: "Ids de handicaps à synchroniser."),
            ])
        )
    )]
    #[OA\Response(
        response: 200,
        description: "Profil mis à jour",
        content: new OA\JsonContent(properties: [
            new OA\Property(property: "message", type: "string", example: "ok"),
            new OA\Property(property: "user", ref: "#/components/schemas/User"),
        ])
    )]
    #[OA\Response(response: 401, description: "Non authentifié")]
    #[OA\Response(response: 422, description: "Erreur de validation")]
    public function meUpdate() {}

    #[OA\Delete(
        path: "/api/me",
        tags: ["Profile"],
        summary: "Supprimer son compte",
        description: "Révoque les tokens puis supprime définitivement le compte de l'utilisateur connecté.",
        security: [["sanctum" => []]]
    )]
    #[OA\Response(
        response: 200,
        description: "Compte supprimé",
        content: new OA\JsonContent(properties: [
            new OA\Property(property: "message", type: "string", example: "ok"),
        ])
    )]
    #[OA\Response(response: 401, description: "Non authentifié")]
    public function meDestroy() {}

    #[OA\Get(
        path: "/api/me/sessions",
        tags: ["Profile"],
        summary: "Séances suivies par l'utilisateur",
        description: "Liste les séances rattachées à l'utilisateur (effectuées / planifiées), triées par `performed_at` décroissant. Chaque séance porte sa table pivot (`user_sessions.id`, `performed_at`).",
        security: [["sanctum" => []]]
    )]
    #[OA\Response(
        response: 200,
        description: "Séances de l'utilisateur",
        content: new OA\JsonContent(properties: [
            new OA\Property(property: "data", type: "array", items: new OA\Items(type: "object")),
        ])
    )]
    public function meSessionsIndex() {}

    #[OA\Get(
        path: "/api/me/sessions/stats",
        tags: ["Profile"],
        summary: "Statistiques de sport",
        description: "Calcule, à partir des séances passées effectuées : `week` (heures de sport par jour pour la semaine courante, lundi → dimanche) et `weekly_average_hours` (moyenne d'heures par semaine active).",
        security: [["sanctum" => []]]
    )]
    #[OA\Response(
        response: 200,
        description: "Statistiques",
        content: new OA\JsonContent(properties: [
            new OA\Property(property: "data", type: "object", properties: [
                new OA\Property(property: "week", type: "array", items: new OA\Items(properties: [
                    new OA\Property(property: "date", type: "string", format: "date", example: "2024-01-15"),
                    new OA\Property(property: "hours", type: "number", format: "float", example: 1.5),
                ])),
                new OA\Property(property: "weekly_average_hours", type: "number", format: "float", example: 3.25),
            ]),
        ])
    )]
    public function meSessionsStats() {}

    #[OA\Post(
        path: "/api/me/sessions",
        tags: ["Profile"],
        summary: "Enregistrer une séance",
        description: "Rattache une séance à l'utilisateur. `performed_at` passé = faite, futur = planifiée, absent = maintenant.",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["workout_session_id"],
                properties: [
                    new OA\Property(property: "workout_session_id", type: "integer", example: 1),
                    new OA\Property(property: "performed_at", type: "string", format: "date-time", nullable: true, example: "2024-01-15 08:00:00"),
                ]
            )
        )
    )]
    #[OA\Response(response: 201, description: "Séance enregistrée", content: new OA\JsonContent(properties: [
        new OA\Property(property: "message", type: "string", example: "ok"),
    ]))]
    public function meSessionsStore() {}

    #[OA\Patch(
        path: "/api/me/sessions/{id}",
        tags: ["Profile"],
        summary: "Modifier une séance suivie",
        description: "Modifie une ligne `user_sessions` (par son id), scoping garanti à l'utilisateur courant.",
        security: [["sanctum" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, description: "Id de la ligne user_sessions.", schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(properties: [
                new OA\Property(property: "workout_session_id", type: "integer", example: 2),
                new OA\Property(property: "performed_at", type: "string", format: "date-time", example: "2024-01-16 08:00:00"),
            ])
        )
    )]
    #[OA\Response(response: 200, description: "Séance modifiée", content: new OA\JsonContent(properties: [
        new OA\Property(property: "message", type: "string", example: "ok"),
    ]))]
    public function meSessionsUpdate() {}

    #[OA\Delete(
        path: "/api/me/sessions/{id}",
        tags: ["Profile"],
        summary: "Supprimer une séance suivie",
        description: "Supprime une ligne `user_sessions` (par son id), scoping garanti à l'utilisateur courant.",
        security: [["sanctum" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, description: "Id de la ligne user_sessions.", schema: new OA\Schema(type: "integer"))]
    )]
    #[OA\Response(response: 200, description: "Séance supprimée", content: new OA\JsonContent(properties: [
        new OA\Property(property: "message", type: "string", example: "ok"),
    ]))]
    public function meSessionsDestroy() {}

    #[OA\Get(
        path: "/api/me/metrics/current",
        tags: ["Profile"],
        summary: "Dernière métrique santé",
        description: "Renvoie la métrique la plus récente (par `recorded_at`) de l'utilisateur, ou `null` si aucune.",
        security: [["sanctum" => []]]
    )]
    #[OA\Response(
        response: 200,
        description: "Métrique courante",
        content: new OA\JsonContent(properties: [
            new OA\Property(property: "data", ref: "#/components/schemas/Metric", nullable: true),
        ])
    )]
    public function meMetricsCurrent() {}

    #[OA\Put(
        path: "/api/me/metrics",
        tags: ["Profile"],
        summary: "Enregistrer les mesures du jour",
        description: "Upsert d'une métrique par jour : si une métrique existe pour la date du jour (même user), elle est mise à jour ; sinon créée. Renvoie 201 à la création, 200 à la mise à jour.",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(properties: [
                new OA\Property(property: "weight_kg", type: "number", format: "float", nullable: true, example: 80.5, description: "Entre 20 et 400."),
                new OA\Property(property: "heart_rate_resting", type: "integer", nullable: true, example: 58, description: "Entre 20 et 220."),
            ])
        )
    )]
    #[OA\Response(response: 200, description: "Métrique mise à jour", content: new OA\JsonContent(properties: [
        new OA\Property(property: "data", ref: "#/components/schemas/Metric"),
    ]))]
    #[OA\Response(response: 201, description: "Métrique créée", content: new OA\JsonContent(properties: [
        new OA\Property(property: "data", ref: "#/components/schemas/Metric"),
    ]))]
    public function meMetricsUpsert() {}
}

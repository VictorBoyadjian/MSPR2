<?php

namespace App\Http\Controllers;

use App\Models\Metric;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HealthMetricController
{
    /**
     * Métrique santé la plus récente de l'utilisateur (poids, pouls au repos…),
     * utilisée pour pré-remplir l'écran Santé. `null` si aucune mesure enregistrée.
     */
    public function current(Request $request): JsonResponse
    {
        $metric = Metric::where('user_id', $request->user()->id)
            ->orderByDesc('recorded_at')
            ->first();

        return response()->json(['data' => $metric]);
    }

    /**
     * Enregistre les mesures du jour. Une seule métrique par jour : si une ligne
     * existe déjà pour aujourd'hui (même user + date de recorded_at), on la met à jour.
     */
    public function upsert(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'weight_kg'          => ['sometimes', 'nullable', 'numeric', 'min:20', 'max:400'],
            'heart_rate_resting' => ['sometimes', 'nullable', 'integer', 'min:20', 'max:220'],
        ]);

        $metric = Metric::where('user_id', $user->id)
            ->whereDate('recorded_at', now()->toDateString())
            ->first()
            ?? new Metric(['user_id' => $user->id, 'recorded_at' => now()]);

        $metric->fill($validated);
        $metric->save();

        return response()->json(['data' => $metric], $metric->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Message du coach IA de l'utilisateur. Renvoie :
     *  - `today`  : le message du jour (null s'il n'a pas encore été généré aujourd'hui) ;
     *  - `latest` : le dernier message disponible (n'importe quel jour), pour servir de
     *               repli à afficher et décider, côté app, s'il faut générer / régénérer.
     */
    public function coachMessage(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $today = Metric::where('user_id', $userId)
            ->whereDate('recorded_at', now()->toDateString())
            ->value('coach_message');

        $latest = Metric::where('user_id', $userId)
            ->whereNotNull('coach_message')
            ->orderByDesc('recorded_at')
            ->first(['coach_message', 'recorded_at']);

        return response()->json(['data' => [
            'date'   => now()->toDateString(),
            'today'  => $today,
            'latest' => $latest ? [
                'message' => $latest->coach_message,
                'date'    => $latest->recorded_at?->toDateString(),
            ] : null,
        ]]);
    }

    /**
     * Enregistre le message du coach IA du jour dans la métrique du jour (upsert :
     * une seule métrique par jour, partagée avec les autres mesures santé).
     * Écriture faite par l'app en arrière-plan après génération par Mistral.
     */
    public function saveCoachMessage(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'coach_message' => ['required', 'string', 'max:2000'],
        ]);

        $metric = Metric::where('user_id', $user->id)
            ->whereDate('recorded_at', now()->toDateString())
            ->first()
            ?? new Metric(['user_id' => $user->id, 'recorded_at' => now()]);

        $metric->coach_message = $validated['coach_message'];
        $metric->save();

        return response()->json(['data' => $metric], $metric->wasRecentlyCreated ? 201 : 200);
    }
}

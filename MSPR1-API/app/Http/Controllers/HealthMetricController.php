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
}

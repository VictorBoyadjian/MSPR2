<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserSessionController
{
    /**
     * Séances de l'utilisateur connecté (effectuées passées / planifiées futures).
     * Chaque séance porte sa table pivot (user_sessions.id + performed_at).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $sessions = $user->workoutSessions()
            ->orderByPivot('performed_at', 'desc')
            ->get();

        return response()->json(['data' => $sessions]);
    }

    /**
     * Statistiques de sport calculées à partir des séances passées effectivement
     * enregistrées (durée portée par workout_sessions.total_duration_min) :
     *  - week : heures de sport par jour pour la semaine en cours (lundi → dimanche) ;
     *  - weekly_average_hours : moyenne d'heures par semaine sur toutes les semaines actives.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        $rows = DB::table('user_sessions as us')
            ->join('workout_sessions as ws', 'ws.id', '=', 'us.workout_session_id')
            ->where('us.user_id', $user->id)
            ->whereNotNull('us.performed_at')
            ->where('us.performed_at', '<=', now())
            ->get(['us.performed_at', 'ws.total_duration_min']);

        // Squelette des 7 jours de la semaine courante, initialisés à 0 h.
        $startOfWeek = now()->startOfWeek();
        $week = [];
        for ($i = 0; $i < 7; $i++) {
            $week[$startOfWeek->copy()->addDays($i)->toDateString()] = 0.0;
        }

        // Minutes cumulées par semaine ISO (clé "année-semaine"), pour la moyenne.
        $weekTotals = [];

        foreach ($rows as $row) {
            $performed = Carbon::parse($row->performed_at);
            $minutes = (float) ($row->total_duration_min ?? 0);

            $day = $performed->toDateString();
            if (array_key_exists($day, $week)) {
                $week[$day] += $minutes / 60;
            }

            $isoWeek = $performed->format('o-W');
            $weekTotals[$isoWeek] = ($weekTotals[$isoWeek] ?? 0) + $minutes;
        }

        $weeklyAverageHours = count($weekTotals) > 0
            ? round(array_sum($weekTotals) / 60 / count($weekTotals), 2)
            : 0.0;

        return response()->json([
            'data' => [
                'week' => collect($week)
                    ->map(fn ($hours, $date) => ['date' => $date, 'hours' => round($hours, 2)])
                    ->values(),
                'weekly_average_hours' => $weeklyAverageHours,
            ],
        ]);
    }

    /**
     * Enregistre une séance pour l'utilisateur : une date passée = faite,
     * une date future = planifiée. Sans date, on prend maintenant.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'workout_session_id' => ['required', 'integer', 'exists:workout_sessions,id'],
            'performed_at'       => ['sometimes', 'nullable', 'date'],
        ]);

        $user->workoutSessions()->attach($validated['workout_session_id'], [
            'performed_at' => $validated['performed_at'] ?? now(),
        ]);

        return response()->json(['message' => 'ok'], 201);
    }

    /**
     * Modifie une séance enregistrée (date et/ou séance), scoped à l'utilisateur.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'workout_session_id' => ['sometimes', 'integer', 'exists:workout_sessions,id'],
            'performed_at'       => ['sometimes', 'date'],
        ]);

        if (! empty($validated)) {
            DB::table('user_sessions')
                ->where('id', $id)
                ->where('user_id', $user->id)
                ->update($validated);
        }

        return response()->json(['message' => 'ok']);
    }

    /**
     * Supprime une séance enregistrée (par l'id de la ligne user_sessions),
     * en s'assurant qu'elle appartient bien à l'utilisateur connecté.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        DB::table('user_sessions')
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->delete();

        return response()->json(['message' => 'ok']);
    }
}

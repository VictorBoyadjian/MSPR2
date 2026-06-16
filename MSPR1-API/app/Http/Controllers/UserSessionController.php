<?php

namespace App\Http\Controllers;

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

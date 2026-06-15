<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfileController {

    /**
     * Met à jour le profil de l'utilisateur connecté.
     * L'utilisateur ne peut modifier que son propre profil :
     * on agit toujours sur $request->user() (issu du token sanctum).
     */
    public function update(Request $request) : JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'email'          => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password'       => ['sometimes', 'string', 'min:8'],
            'first_name'     => ['sometimes', 'nullable', 'string', 'max:100'],
            'last_name'      => ['sometimes', 'nullable', 'string', 'max:100'],
            'age'            => ['sometimes', 'nullable', 'integer', 'min:0'],
            'gender'         => ['sometimes', 'nullable', Rule::in(['male', 'female', 'other'])],
            'weight_kg'      => ['sometimes', 'nullable', 'numeric'],
            'height_cm'      => ['sometimes', 'nullable', 'numeric'],
            'bodyfat'        => ['sometimes', 'nullable', 'numeric'],
            'rest_bpm'       => ['sometimes', 'nullable', 'integer'],
            'sport_per_week' => ['sometimes', 'nullable', 'numeric'],
            'allergies'      => ['sometimes', 'array'],
            'allergies.*'    => ['integer', 'exists:allergies,id'],
        ]);

        $user->fill(collect($validated)->except('allergies')->all());
        $user->save();

        if ($request->has('allergies')) {
            $user->allergies()->sync($validated['allergies'] ?? []);
        }

        return response()->json([
            'message' => 'ok',
            'user'    => $user->load('allergies'),
        ]);
    }
}

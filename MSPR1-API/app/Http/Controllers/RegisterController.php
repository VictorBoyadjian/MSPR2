<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegisterController {

    public function register(Request $request) : JsonResponse
    {
        $user = User::create([
            'email' => $request->input('email'),
            'password' => $request->input('password'),
            'first_name' => $request->input('first_name'),
            'last_name' => $request->input('last_name'),
            'age' => $request->input('age'),
            'gender' => $request->input('gender'),
            'weight_kg' => $request->input('weight_kg'),
            'height_cm' => $request->input('height_cm'),
        ]);

        if($user) {
            $user->assignRole('Administrator');
            return response()->json(['message' => 'ok']);
        };

        return response()->json(['message' => 'error']);
       
    }
}
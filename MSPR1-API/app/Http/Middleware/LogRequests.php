<?php

namespace App\Http\Middleware;

use App\Models\Log;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogRequests
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        Log::create([
            'api_name' => env('APP_NAME'),
            'data' => $request->path(),
            'ip' => $request->ip(),
            'type' => 'request'
        ]);

        return $next($request);
    }
}

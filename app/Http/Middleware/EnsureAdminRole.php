<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        \Illuminate\Support\Facades\Log::info('EnsureAdminRole Triggered', [
            'user_id' => $user ? $user->id : null,
            'user_role' => $user ? $user->role : 'NO_ROLE_FOUND'
        ]);

        if ($user && strtolower(trim($user->role)) !== 'admin') {
            $roleVal = $user->role === null ? 'NULL' : ($user->role === '' ? 'EMPTY_STRING' : $user->role);
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Admin access required. (Role is: ' . $roleVal . ')'
            ], 403);
        }

        return $next($request);
    }
}

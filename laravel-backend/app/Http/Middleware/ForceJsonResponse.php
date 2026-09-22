<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceJsonResponse
{
    /**
     * Force every request through this middleware to accept JSON.
     *
     * This ensures Laravel returns 422 with a JSON body on validation
     * failures, instead of the default 302 redirect. It applies to the
     * whole /api group (see bootstrap/app.php), so any client hitting
     * the API gets JSON — regardless of what headers they sent.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');
        return $next($request);
    }
}

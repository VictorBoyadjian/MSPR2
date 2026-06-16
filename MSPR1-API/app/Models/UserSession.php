<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * Pivot user_sessions. Le cast datetime force une sérialisation ISO-8601 UTC
 * de performed_at (sinon chaîne brute sans fuseau → décalage côté front).
 */
class UserSession extends Pivot
{
    protected $table = 'user_sessions';

    public $incrementing = true;

    public $timestamps = false;

    protected $casts = [
        'performed_at' => 'datetime',
    ];
}

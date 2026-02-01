<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\HasUuid;  // Tambahkan ini
use Illuminate\Database\Eloquent\SoftDeletes;  // Tambahkan ini

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuid, SoftDeletes;  // Tambahkan HasUuid dan SoftDeletes

    protected $fillable = [
        'uuid',        // Tambahkan ini
        'name',
        'email',
        'password',
        'phone',
        'role',
        'permissions'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'permissions' => 'array',  // Tambahkan ini
        ];
    }
}
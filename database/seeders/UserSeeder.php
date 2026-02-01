<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@more.test'],
            [
                'uuid' => Str::uuid(),
                'name' => 'Admin User',
                'password' => Hash::make('password'),
            ]
        );
    }
}

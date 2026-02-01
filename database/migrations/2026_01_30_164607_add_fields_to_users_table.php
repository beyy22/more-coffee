<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('uuid')->unique()->after('id');
            $table->string('phone')->nullable()->after('email');
            $table->enum('role', ['admin', 'staff', 'customer'])->default('customer')->after('phone');
            $table->json('permissions')->nullable()->after('role');
            $table->softDeletes()->after('updated_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['uuid', 'phone', 'role', 'permissions']);
            $table->dropSoftDeletes();
        });
    }
};
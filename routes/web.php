<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/install-db', function () {
    $key = request()->query('key');
    if ($key !== 'rahasia123') {
        abort(403, 'Unauthorized');
    }
    
    \Illuminate\Support\Facades\Artisan::call('migrate:fresh --seed --force');
    return 'Database berhasil di-reset dan di-isi! Admin: admin@more.test / password';
});

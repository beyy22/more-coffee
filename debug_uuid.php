<?php
use App\Models\Category;
use Illuminate\Support\Str;

require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Creating category...\n";
    $category = new Category();
    $category->name = 'Debug Category';
    $category->slug = 'debug-category';
    // $category->uuid should be auto-filled by trait
    $category->save();
    
    echo "Success! UUID: " . $category->uuid . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

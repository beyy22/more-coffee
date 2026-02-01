<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Disable foreign key checks to allow truncation if necessary, though set null handles it.
        // Or just normal truncate since set null is constraint.
        // Actually, truncate might fail with FK checks enabled on some DBs even with set null?
        // Let's use delete() which triggers the constraint? Or Schema disable FK.
        
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        \App\Models\Category::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $categories = [
            'Bottled Series', 
            'Signature Drinks', 
            'Coffee Based', 
            'Black Series', 
            'Milk Based', 
            'Flavoured Tea', 
            'Refreshment', 
            'Main Course', 
            'Snacks', 
            'Dimsum', 
            'Dessert', 
            'Indomie'
        ];

        foreach ($categories as $name) {
            \App\Models\Category::factory()->create([
                'name' => $name,
                'slug' => \Illuminate\Support\Str::slug($name),
                'is_active' => true,
            ]);
        }
    }
}

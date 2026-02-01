<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);
        return [
            'uuid' => fake()->uuid(),
            'category_id' => \App\Models\Category::factory(),
            'name' => ucfirst($name),
            'slug' => \Illuminate\Support\Str::slug($name),
            'description' => fake()->paragraph(),
            'price' => fake()->numberBetween(10, 500) * 1000, // Harga kelipatan 1000
            'cost_price' => fake()->numberBetween(5, 250) * 1000,
            'sku' => fake()->unique()->bothify('SKU-####'),
            'stock' => fake()->numberBetween(0, 100),
            'min_stock' => 10,
            'is_available' => fake()->boolean(90),
            'is_featured' => fake()->boolean(10),
            'sort_order' => 0,
            'images' => ['https://placehold.co/600x400/8B4513/FFF?text=' . urlencode($name)],
            'preparation_time' => fake()->numberBetween(5, 15),
        ];
    }
}

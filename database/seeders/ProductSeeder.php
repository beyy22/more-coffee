<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate products table
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        \App\Models\Product::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $data = [
            'Bottled Series' => [
                ['name' => 'Es Kopi Lokal More Smooth 1L', 'price' => 115000, 'description' => 'Kopi Lokal More Smooth 1 Liter'],
                ['name' => 'Americano 1L', 'price' => 95000, 'description' => 'Americano kemasan 1 liter'],
                ['name' => 'Cafe Latte 1L', 'price' => 100000, 'description' => 'Cafe Latte kemasan 1 liter'],
                ['name' => 'Es Kopi Lokal 1L', 'price' => 100000, 'description' => 'Kopi Lokal MORE kemasan 1 liter'],
                ['name' => 'Matcha Latte 1L', 'price' => 100000, 'description' => 'Matcha Latte kemasan 1 liter'],
            ],
            'Signature Drinks' => [
                ['name' => 'Es Kopi Lokal MORE (Terlaris)', 'price' => 27000, 'description' => 'Espresso, Fresh Milk, Syrup, Palm Sugar'],
                ['name' => 'Es Kopi Lokal More Smooth (Paling disukai)', 'price' => 26000, 'description' => 'Espresso, Extra Fresh Milk, Mixed Foam Cream, Syrup'],
                ['name' => 'Es Kopi Susu Mendung (Hidangan khas)', 'price' => 26000, 'description' => 'Espresso, Fresh Milk, Syrup, Cream Foam (Awan)'],
                ['name' => 'Es Kopi Lokal Keju', 'price' => 27000, 'description' => 'Espresso, Fresh Milk, Syrup, Cheese Cream Foam'],
                ['name' => 'Lokal More Plus', 'price' => 28000, 'description' => 'Espresso Xtra Shot, Fresh Milk, Syrup'],
            ],
            'Coffee Based' => [
                ['name' => 'Cafe Latte', 'price' => 26000, 'description' => 'Espresso, Fresh Milk'],
                ['name' => 'Cappucinno', 'price' => 27000, 'description' => 'Espresso, Fresh Milk, Milk Foam'],
                ['name' => 'Spanish Latte', 'price' => 27000, 'description' => 'Espresso, Fresh Milk, Sweet Condensed Milk'],
                ['name' => 'Mochaccino', 'price' => 28000, 'description' => 'Espresso, Dark Cocoa, Fresh Milk'],
                ['name' => 'Caramel Latte', 'price' => 29000, 'description' => 'Espresso, Freshmilk, Caramel Syrup'],
            ],
            'Black Series' => [
                ['name' => 'Americano', 'price' => 24000, 'description' => 'Espresso, Water'],
                ['name' => 'Lemonade Americano (Terlaris)', 'price' => 27000, 'description' => 'Espresso, Water, Lemon Syrup'],
                ['name' => 'Sunnycano', 'price' => 29000, 'description' => 'Espresso, Mineral Water, Sunkist'],
                ['name' => 'Berrycano', 'price' => 30000, 'description' => 'Espresso, Water, Mix Berry'],
            ],
            'Milk Based' => [
                ['name' => 'Susu Caramel', 'price' => 21000, 'description' => 'Fresh Milk, Caramel Syrup'],
                ['name' => 'Susu Vanilla', 'price' => 21000, 'description' => 'Fresh Milk, Vanilla Syrup'],
                ['name' => 'Susu Banana', 'price' => 21000, 'description' => 'Fresh Milk, Banana Syrup'],
                ['name' => 'Matcha Latte (Terlaris)', 'price' => 24000, 'description' => 'Matcha Powder with Fresh Milk'],
                ['name' => 'Chocomilo Dinosaur', 'price' => 24000, 'description' => 'Chocomilo with Fresh Milk'],
            ],
            'Flavoured Tea' => [
                ['name' => 'Lemon Tea', 'price' => 23000, 'description' => 'Black Tea with Lemon Hint'],
                ['name' => 'Lychee Tea', 'price' => 23000, 'description' => 'Black Tea with Lychee Hint'],
                ['name' => 'Mango Tea', 'price' => 23000, 'description' => 'Black Tea with Mango Hint'],
                ['name' => 'Peach Tea', 'price' => 25000, 'description' => 'Black Tea with Peach Hint'],
            ],
            'Refreshment' => [
                ['name' => 'The Red Stark', 'price' => 32000, 'description' => 'Earl Grey, Sakura Syrup, Mix Berry Syrup'],
                ['name' => 'I Am Groot', 'price' => 32000, 'description' => 'Cold Brew, Green Apple Syrup, Lemon Juice'],
                ['name' => 'Summer Breeze', 'price' => 32000, 'description' => 'Lemon Juice, Lychee Syrup, Sugar'],
            ],
            'Main Course' => [
                ['name' => 'Ricebowl Chicken Teriyaki', 'price' => 32000, 'description' => 'Rice, Chicken Teriyaki, Egg'],
                ['name' => 'Ricebowl Ayam Suwir Cabe', 'price' => 32000, 'description' => 'Rice, Sheredded Chicken, Red Chili Sambal, Egg'],
                ['name' => 'Ricebowl Ayam Fillet Taichan', 'price' => 32000, 'description' => 'Rice, Chicken Fillet, Sambal Taichan'],
                ['name' => 'Nasi Goreng Kampung', 'price' => 32000, 'description' => 'Sweet and Spicy Fried Rice, Egg, Shrimp Crackers'],
                ['name' => 'Nasi Goreng Rempah', 'price' => 32000, 'description' => 'Non-Spicy Fried Rice, Turmeric, Kencur, Egg, Shrimp Crackers'],
            ],
            'Snacks' => [
                ['name' => 'Crispy Onion Ring', 'price' => 22000, 'description' => 'Crispy Onion Ring with Tartar Sauce'],
                ['name' => 'Kentang Goreng +Sosis', 'price' => 24000, 'description' => 'French Fries, Sausage'],
                ['name' => 'Bala-Bala Sambal Kacang', 'price' => 24000, 'description' => 'Bala-Bala isi 5pcs dengan tambahan cabe rawit hijau dan sambal kacang'],
                ['name' => 'Kulit Cabe Garam', 'price' => 25000, 'description' => 'Kulit Crispy, Kol goreng, Cabe'],
                ['name' => 'Tempe Mendoan', 'price' => 25000, 'description' => 'Fried Tempe with Sweet Soy Sambal'],
            ],
            'Dimsum' => [
                ['name' => 'Dimsum Ayam', 'price' => 26000, 'description' => 'Chicken Dimsum, Chili Oil, Bangkok Sauce, Mayo'],
                ['name' => 'Dimsum Mozarella', 'price' => 26000, 'description' => 'Chicken Filled Dimsum with added Mozarella Topping'],
                ['name' => 'Dimsum Lumpia Kulit Tahu', 'price' => 26000, 'description' => 'Tofu Skin, Shrimp, Chicken, Chili Oil, Bangkok Sauce, Mayo'],
                ['name' => 'Dimsum Lumpia Keju', 'price' => 28000, 'description' => 'Shrimp, Chicken, Chili Oil, Bangkok Sauce, Mayo'],
                ['name' => 'Dimsum Udang Keju', 'price' => 29000, 'description' => 'Shrimp Cheese Dimsum, Chili Oil, Bangkok Sauce, Mayo'],
            ],
            'Dessert' => [
                ['name' => 'Roti Goreng Cokelat Keju', 'price' => 22000, 'description' => 'Chocolate Filled Bread, Cheese'],
                ['name' => 'Roti Goreng Es Krim', 'price' => 24000, 'description' => 'Chocolate Filled Bread, Vanilla Ice Cream'],
                ['name' => 'Pisang Nugget Cokelat Keju', 'price' => 23000, 'description' => null],
            ],
            'Indomie' => [
                ['name' => 'Indomie Rebus', 'price' => 21000, 'description' => 'Boiled Noodle'],
                ['name' => 'Indomie Goreng', 'price' => 21000, 'description' => 'Fried Noodle'],
                ['name' => 'Indomie Ala More', 'price' => 26000, 'description' => 'Noodle and Egg With Sweet and Spicy Flavor'],
            ]
        ];

        $categoryImages = [
            'Bottled Series' => '/images/products/bottled_coffee_series.png',
            'Signature Drinks' => '/images/products/iced_coffee_signature.png',
            'Coffee Based' => '/images/products/hot_coffee_latte.png',
            'Black Series' => '/images/products/hot_coffee_latte.png',
            'Milk Based' => '/images/products/iced_coffee_signature.png',
            'Flavoured Tea' => '/images/products/fruit_tea_refreshment.png',
            'Refreshment' => '/images/products/fruit_tea_refreshment.png',
            'Main Course' => '/images/products/rice_bowl_teriyaki.png',
            'Snacks' => '/images/products/snacks_platter.png',
            'Dimsum' => '/images/products/dimsum_platter.png',
            'Dessert' => '/images/products/snacks_platter.png',
            'Indomie' => '/images/products/indomie_gourmet.png',
        ];

        foreach ($data as $categoryName => $products) {
            $category = \App\Models\Category::where('name', $categoryName)->first();
            
            if (!$category) {
                 $category = \App\Models\Category::factory()->create(['name' => $categoryName, 'slug' => \Illuminate\Support\Str::slug($categoryName)]);
            }

            $imageUrl = $categoryImages[$categoryName] ?? null;

            foreach ($products as $product) {
                \App\Models\Product::factory()->create([
                    'category_id' => $category->id,
                    'name' => $product['name'],
                    'slug' => \Illuminate\Support\Str::slug($product['name']),
                    'price' => $product['price'],
                    'description' => $product['description'],
                    'stock' => rand(10, 50),
                    'is_available' => true,
                    'images' => $imageUrl ? [$imageUrl] : null,
                ]);
            }
        }
    }
}

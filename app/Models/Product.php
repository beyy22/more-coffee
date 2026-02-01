<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasUuid;

class Product extends Model
{
    use HasFactory, HasUuid, SoftDeletes;

    protected $appends = ['image_url'];

    protected $fillable = [
        'uuid',
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'cost_price',
        'sku',
        'stock',
        'min_stock',
        'variants',
        'addons',
        'images',
        'preparation_time',
        'is_available',
        'is_featured',
        'sort_order'
    ];

    protected $casts = [
        'variants' => 'array',
        'addons' => 'array',
        'images' => 'array',
        'price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'is_available' => 'boolean',
        'is_featured' => 'boolean'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getImageUrlAttribute()
    {
        if (!empty($this->images) && is_array($this->images) && isset($this->images[0])) {
            $image = $this->images[0];
            
            if (filter_var($image, FILTER_VALIDATE_URL)) {
                return $image;
            }
            
            // If path starts with /, it's a static asset (e.g. from seeder), return as relative path
            if (str_starts_with($image, '/')) {
                return $image; 
            }

            return asset('storage/' . $image);
        }
        return null;
    }
}
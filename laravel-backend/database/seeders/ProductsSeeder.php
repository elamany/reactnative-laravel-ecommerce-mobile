<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductsSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Ethiopian Coffee Beans (500g)',
                'description' => 'Single-origin Yirgacheffe, medium roast, whole beans.',
                'price' => 850.00,
                'stock' => 25,
                'image_url' => 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600',
            ],
            [
                'name' => 'Handwoven Habesha Scarf',
                'description' => 'Traditional cotton scarf woven by artisans in Bahir Dar.',
                'price' => 1200.00,
                'stock' => 12,
                'image_url' => 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600',
            ],
            [
                'name' => 'Leather Journal',
                'description' => 'Hand-stitched leather-bound notebook, 200 pages.',
                'price' => 650.00,
                'stock' => 40,
                'image_url' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
            ],
            [
                'name' => 'Ceramic Coffee Cup',
                'description' => 'Pottery coffee cup with traditional Ethiopian patterns.',
                'price' => 380.00,
                'stock' => 3,
                'image_url' => 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600',
            ],
            [
                'name' => 'Ethiopian Spice Blend (Berbere)',
                'description' => 'Authentic berbere spice mix, 250g jar.',
                'price' => 420.00,
                'stock' => 0,
                'image_url' => 'https://images.unsplash.com/photo-1599909533730-fa755f5b6701?w=600',
            ],
            [
                'name' => 'Silver Cross Pendant',
                'description' => 'Ethiopian Orthodox cross, sterling silver, handmade.',
                'price' => 2400.00,
                'stock' => 8,
                'image_url' => 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}   

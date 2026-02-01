<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
        ]);

        if ($request->file('image')) {
            $file = $request->file('image');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            
            // Simpan ke storage 'public' folder 'uploads'
             // Ensure "php artisan storage:link" is run
            $path = $file->storeAs('uploads', $filename, 'public');

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'url' => url('storage/' . $path),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Image upload failed'
        ], 500);
    }
}

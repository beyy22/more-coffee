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
            
            // Tentukan Disk (Local/Public atau Cloudinary dari env)
            $disk = config('filesystems.default', 'public'); 

            // Simpan file logic
            // Jika Cloudinary, dia otomatis upload ke Cloud
            $path = $file->storeAs('uploads', $filename, $disk);

            // Generate URL
            $url = Storage::disk($disk)->url($path);
            
            // Fix untuk Local Driver (tambahkan domain jika relative path)
            if ($disk === 'public' && !Str::startsWith($url, ['http://', 'https://'])) {
                $url = url($url);
            }

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'url' => $url,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Image upload failed'
        ], 500);
    }
}

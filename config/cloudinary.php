<?php

/*
 * This file is part of the Laravel Cloudinary package.
 *
 * (c) CloudinaryLabs <support@cloudinary.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

$cloudinaryUrl = env('CLOUDINARY_URL');
$cloudName = env('CLOUDINARY_CLOUD_NAME');
$apiKey = env('CLOUDINARY_API_KEY');
$apiSecret = env('CLOUDINARY_API_SECRET');

if ($cloudinaryUrl && (!$cloudName || !$apiKey || !$apiSecret)) {
    // Manually parse the CLOUDINARY_URL if individual vars are missing
    // Format: cloudinary://<api_key>:<api_secret>@<cloud_name>
    if (preg_match('/cloudinary:\/\/(.*?):(.*?)@(.*?)$/', $cloudinaryUrl, $matches)) {
        $apiKey = $matches[1];
        $apiSecret = $matches[2];
        $cloudName = $matches[3];
    }
}

return [

    /*
    |--------------------------------------------------------------------------
    | Cloudinary Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your Cloudinary settings. Cloudinary is a cloud hosted
    | media management service for all your file uploads.
    |
    |
    */
    'cloud_url' => env('CLOUDINARY_URL'),

    /**
     * Cloudinary URL for the Media Optimizer.
     */
    'optimizer_url' => env('CLOUDINARY_OPTIMIZER_URL'),

    /**
     * Cloudinary URL for the Video Optimizer.
     */
    'video_optimizer_url' => env('CLOUDINARY_VIDEO_OPTIMIZER_URL'),

    /**
     * The section of the configuration below is for the Cloudinary V2 SDK.
     *
    */
    'notification_url' => env('CLOUDINARY_NOTIFICATION_URL'),
];

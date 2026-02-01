<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class BaseController extends Controller
{
    use ApiResponse;

    protected $service;

    public function __construct($service = null)
    {
        $this->service = $service;
    }
}
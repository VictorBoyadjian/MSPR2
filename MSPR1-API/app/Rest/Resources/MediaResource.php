<?php

namespace App\Rest\Resources;

use App\Models\Media;
use Illuminate\Database\Eloquent\Model;
use Lomkit\Rest\Http\Requests\RestRequest;
use Lomkit\Rest\Relations\MorphTo;
use Override;

class MediaResource extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<Model>
     */
    public static $model = Media::class;

    /**
     * The exposed fields that could be provided
     */
    public function fields(RestRequest $request): array
    {
        return [
            'id',
            'collection_name',
            'name',
            'file_name',
            'mime_type',
            'original_url',
            'preview_url',
            'order_column',
        ];
    }
    /**
     * The exposed limits that could be provided
     */
    public function limits(RestRequest $request): array
    {
        return [
            10,
            25,
            50,
        ];
    }
}
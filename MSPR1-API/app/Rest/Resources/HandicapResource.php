<?php

namespace App\Rest\Resources;

use App\Models\Handicap;
use App\Rest\Resources\Resource;
use Lomkit\Rest\Relations\BelongsToMany;

class HandicapResource extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<\Illuminate\Database\Eloquent\Model>
     */
    public static $model = Handicap::class;

    /**
     * The exposed fields that could be provided
     * @param RestRequest $request
     * @return array
     */
    public function fields(\Lomkit\Rest\Http\Requests\RestRequest $request): array
    {
        return [
            'id',
            'name',
            'label',
        ];
    }

    /**
     * The exposed relations that could be provided
     * @param RestRequest $request
     * @return array
     */
    public function relations(\Lomkit\Rest\Http\Requests\RestRequest $request): array
    {
        return [
            BelongsToMany::make('users', UserResource::class),
        ];
    }

    /**
     * The exposed scopes that could be provided
     * @param RestRequest $request
     * @return array
     */
    public function scopes(\Lomkit\Rest\Http\Requests\RestRequest $request): array
    {
        return [];
    }

    /**
     * The exposed limits that could be provided
     * @param RestRequest $request
     * @return array
     */
    public function limits(\Lomkit\Rest\Http\Requests\RestRequest $request): array
    {
        return [
            10,
            25,
            50
        ];
    }

    /**
     * The actions that should be linked
     * @param RestRequest $request
     * @return array
     */
    public function actions(\Lomkit\Rest\Http\Requests\RestRequest $request): array {
        return [];
    }

    /**
     * The instructions that should be linked
     * @param RestRequest $request
     * @return array
     */
    public function instructions(\Lomkit\Rest\Http\Requests\RestRequest $request): array {
        return [];
    }
}

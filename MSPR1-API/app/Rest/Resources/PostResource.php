<?php

namespace App\Rest\Resources;

use App\Models\Post;
use App\Rest\Resources\Resource;
use Lomkit\Rest\Http\Requests\MutateRequest;
use Illuminate\Database\Eloquent\Model;
use Lomkit\Rest\Relations\{BelongsTo, BelongsToMany, HasMany, MorphMany};
use Override;

class PostResource extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<\Illuminate\Database\Eloquent\Model>
     */
    public static $model = Post::class;

    /**
     * The exposed fields that could be provided
     * @param RestRequest $request
     * @return array
     */
    public function fields(\Lomkit\Rest\Http\Requests\RestRequest $request): array
    {
        return [
            'id',
            'content',
            'user_id',
            'created_at',
            'updated_at',
            'likes',
            'hasLiked'
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
            BelongsTo::make('user', UserResource::class),
            HasMany::make('comments', CommentResource::class),
            BelongsToMany::make('likers', UserResource::class),
            MorphMany::make('medias', MediaResource::class)
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

    #[Override]
    public function mutated(MutateRequest $request, array $requestBody, Model $model): void
    {
        if(isset($request['medias'])){
            foreach($request['medias'] as $media){
                $collection = $media['collection'];
                
                if (!$collection || !array_key_exists($collection, $model->getRegisteredMediaCollections()->toArray())) {
                    throw new \Exception(sprintf("This media collection '%s' is not registered on the model %s", $collection, get_class($model)));
                }

                $model
                    ->addMedia($media['file'])
                    ->toMediaCollection($collection);
            }
        }
    }
}

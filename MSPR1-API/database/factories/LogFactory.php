<?php

namespace Database\Factories;

use App\Models\Log;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Log>
 */
class LogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $appNames = [
            'ml-api',
            'Laravel',
            'image-analysis-api'
        ];

        $types = [
            'request',
            'error'
        ];

        $errors = [
            'image-analysis-api' => [
                'HTTPException: 401 Invalid token',
                'HTTPException: 500 Internal server error',
                'ConnectionError: HTTPConnectionPool(host=\'localhost\', port=11434): Max retries exceeded with url: /api/generate (Caused by NewConnectionError: Failed to establish a new connection: [Errno 111] Connection refused)',
                'ollama._types.ResponseError: model \'llava\' not found, try pulling it first',
                'requests.exceptions.Timeout: HTTPSConnectionPool(host=\'api.mistral.ai\', port=443): Read timed out. (read timeout=30)',
                'requests.exceptions.HTTPError: 429 Client Error: Too Many Requests for url: https://api.mistral.ai/v1/chat/completions',
                'requests.exceptions.HTTPError: 401 Client Error: Unauthorized for url: https://api.mistral.ai/v1/chat/completions',
                'pydantic_core._pydantic_core.ValidationError: 1 validation error for UploadDish image Field required [type=missing]',
                'binascii.Error: Invalid base64-encoded string: number of data characters (101) cannot be 1 more than a multiple of 4',
                'ValueError: Invalid base64 image data: incorrect padding',
                'KeyError: \'LARAVEL_HOST\'',
                'TypeError: can only concatenate str (not "NoneType") to str',
                'AttributeError: \'NoneType\' object has no attribute \'host\'',
                'json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)',
                'ollama._types.ResponseError: model requires more system memory (8.4 GiB) than is available (5.2 GiB)',
                'requests.exceptions.ConnectionError: [LogService] Can\'t send log : Failed to resolve \'laravel-host\' ([Errno -2] Name or service not known)',
                'fastapi.exceptions.RequestValidationError: body -> image: field required',
                'UnicodeDecodeError: \'utf-8\' codec can\'t decode byte 0xff in position 0: invalid start byte',
                'PIL.UnidentifiedImageError: cannot identify image file: unsupported or corrupted image format',
                'ollama._types.ResponseError: failed to pull model \'llava\': context deadline exceeded',
                'requests.exceptions.SSLError: HTTPSConnectionPool(host=\'api.mistral.ai\', port=443): certificate verify failed',
                'KeyError: \'choices\' - unexpected response shape from Mistral API',
                'ValueError: not enough values to unpack (expected 2, got 1)',
                'HTTPException: 401 Authorization header missing',
                'jwt.exceptions.ExpiredSignatureError: Signature has expired',
                'jwt.exceptions.InvalidTokenError: Not enough segments',
                'requests.exceptions.HTTPError: 503 Server Error: Service Unavailable for url: https://api.mistral.ai/v1/chat/completions',
                'MemoryError: Unable to allocate array for image tensor',
                'asyncio.exceptions.TimeoutError: Ollama generation exceeded the allotted time limit',
                'ZeroDivisionError: division by zero while computing nutritional values in dish-calculate',
            ],
            'ml-api' => [
                "AttributeError: 'NoneType' object has no attribute 'client'",
                "TypeError: unsupported operand type(s) for /: 'NoneType' and 'float'",
                "ValueError: could not convert string to float: 'abc'",
                "TypeError: recommend() missing 1 required positional argument: 'data'",
                "ValueError: math domain error",
                "ZeroDivisionError: division by zero",
                "TypeError: 'int' object is not subscriptable",
                "KeyError: 'prise_masse_confirme'",
                "IndexError: list index out of range",
                "AttributeError: 'FitnessService' object has no attribute '_model'",
                "ModuleNotFoundError: No module named 'ml.src.preprocessing.engineer'",
                "ImportError: cannot import name 'get_program' from 'ml.src.recommendation_engine.engine'",
                "ModuleNotFoundError: No module named 'psycopg2'",
                "ImportError: numpy.core.multiarray failed to import",
                "FileNotFoundError: [Errno 2] No such file or directory: 'ml/models/model.pkl'",
                "FileNotFoundError: [Errno 2] No such file or directory: 'ml/models/encoder.pkl'",
                "PermissionError: [Errno 13] Permission denied: 'ml/models/model.pkl'",
                "OSError: [Errno 28] No space left on device",
                "psycopg2.OperationalError: could not connect to server: Connection refused",
                "psycopg2.OperationalError: FATAL: password authentication failed for user 'postgres'",
                "psycopg2.errors.UndefinedTable: relation \"meals\" does not exist",
                "psycopg2.errors.UndefinedColumn: column \"profiles\" does not exist",
                "psycopg2.errors.InvalidSchemaName: schema \"Data\" does not exist",
                "psycopg2.OperationalError: server closed the connection unexpectedly",
                "requests.exceptions.Timeout: HTTPSConnectionPool: Read timed out. (read timeout=10)",
                "requests.exceptions.ConnectionError: Failed to establish a new connection: [Errno 111]",
                "requests.exceptions.HTTPError: 401 Client Error: Unauthorized for url",
                "joblib.externals.loky.process_executor.TerminatedWorkerError: A worker process managed by the executor was unexpectedly terminated",
                "sklearn.exceptions.NotFittedError: This RandomForestClassifier instance is not fitted yet",
                "_pickle.UnpicklingError: invalid load key, '\\x00'",
            ]
        ];

        $routes = [
            'image-analysis-api' => [
                '/health/',
                '/analyze',
                '/analyze-by-mistral',
                '/dish-calculate',
            ],
            'ml-api' => [
                '/health',
                '/recommend',
                '/profiles',
                '/nutrition/meals',
                '/nutrition/calories',
                '/logs/feedback',
                '/logs/comparison',
                '/sessions/exercises',
            ],
            'Laravel' =>[
                'login',
                'register',
                'allergies',
                'allergies/search',
                'allergies/mutate',
                'dishes',
                'dishes/search',
                'dishes/mutate',
                'workout_exercises',
                'workout_exercises/search',
                'workout_exercises/mutate',
                'workout_sessions',
                'workout_sessions/search',
                'workout_sessions/mutate',
                'goals',
                'goals/search',
                'goals/mutate',
                'handicaps',
                'handicaps/search',
                'handicaps/mutate',
                'metrics',
                'metrics/search',
                'metrics/mutate',
                'posts',
                'posts/search',
                'posts/mutate',
                'comments',
                'comments/search',
                'comments/mutate',
                'users/search',
                'logs',
                'logs/search',
                'logs/mutate',
                'me',
                'logout'
            ]
        ];
        
        $appName = $appNames[random_int(0,  count($appNames) - 1)];
        $type = $appName === 'Laravel' ? $types[0] : $types[random_int(0,  count($types) - 1)];
        $isRequest =  $type === $types[0];

        return [
            'api_name' => $appName,
            'type' => $type,
            'data' => $isRequest ? $routes[$appName][random_int(0, count($routes) - 1)] : $errors[$appName][random_int(0, count($errors) - 1)],
            'ip' => $isRequest ? fake()->ipv4() : null
        ];
    }
}

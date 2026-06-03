FROM composer:2.8 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --optimize-autoloader \
    --no-dev \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --ignore-platform-reqs

COPY . .

RUN composer dump-autoload --optimize --no-dev

FROM php:8.2-fpm-alpine

LABEL maintainer="MSPR1-API"

RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpq \
    libpq-dev \
    zip \
    unzip \
    fcgi \
    gettext

RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    opcache \
    pcntl \
    bcmath

RUN { \
    echo 'opcache.enable=1'; \
    echo 'opcache.memory_consumption=256'; \
    echo 'opcache.interned_strings_buffer=16'; \
    echo 'opcache.max_accelerated_files=20000'; \
    echo 'opcache.revalidate_freq=0'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.fast_shutdown=1'; \
    } > /usr/local/etc/php/conf.d/opcache.ini

RUN sed -i 's|error_log = /var/log/php-fpm.log|error_log = /proc/self/fd/2|' /usr/local/etc/php-fpm.conf || true

WORKDIR /var/www/html

COPY --from=vendor /app/vendor ./vendor
COPY . .

COPY docker/nginx.conf /etc/nginx/nginx.conf.template

RUN mkdir -p /var/log/supervisor
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN mkdir -p storage/logs storage/framework/cache/data \
    storage/framework/sessions storage/framework/views \
    storage/api-docs \
    bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE ${PORT:-80}

CMD ["sh", "-c", \
    "if [ -z \"$APP_KEY\" ]; then echo 'ERROR: APP_KEY is not set.'; exit 1; fi && \
    export PORT=${PORT:-80} && \
    envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && \
    php artisan migrate --force || true && \
    php artisan l5-swagger:generate || true && \
    php artisan config:cache || true && \
    php artisan route:cache || true && \
    php artisan view:cache || true && \
    chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
    exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf"]

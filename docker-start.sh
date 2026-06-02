#!/bin/bash
set -e

echo "Running database migrations..."
php artisan migrate --force

if [ "$RUN_SEEDERS" = "true" ]; then
    echo "Running database seeders..."
    php artisan db:seed --force
fi

echo "Starting Apache..."
apache2-foreground

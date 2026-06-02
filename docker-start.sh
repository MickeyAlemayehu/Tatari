#!/bin/bash
set -e

echo "Running database migrations..."
php artisan migrate --force

echo "Starting Apache..."
apache2-foreground

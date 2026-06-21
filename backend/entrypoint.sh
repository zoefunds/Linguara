#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma db push --skip-generate --accept-data-loss || echo "DB push failed, continuing..."

echo "Starting Linguara API..."
exec node dist/index.js

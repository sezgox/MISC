#!/bin/sh
set -eu

echo "Applying Prisma migrations..."
npx prisma migrate deploy

echo "Starting backend..."
exec node dist/main

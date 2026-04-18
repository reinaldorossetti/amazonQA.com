#!/bin/sh
# Wait for Postgres to be available, then seed DB and start server
set -e

host="$POSTGRES_HOST"
port="${POSTGRES_PORT:-5432}"
user="$POSTGRES_USER"
password="$POSTGRES_PASSWORD"
db="$POSTGRES_DB"

# Default to localhost if not set
host="${host:-postgres}"

echo "Waiting for Postgres at $host:$port..."
until nc -z "$host" "$port"; do
  sleep 1
done
echo "Postgres is up!"

echo "Seeding database..."
npm run db:reset || true

echo "Starting server..."
exec npm run dev
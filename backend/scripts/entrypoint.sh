#!/usr/bin/env bash
set -e

echo "==> Waiting for Postgres..."
until pg_isready -h "${DATABASE_HOST:-db}" -p "${DATABASE_PORT:-5432}" -U "${DATABASE_USER}" -d "${DATABASE_NAME}" >/dev/null 2>&1
do
  sleep 1
done
echo "==> Postgres ready."

echo "==> Enabling required Postgres extensions..."
# This requires psql client (you already installed postgresql-client)
psql "postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST:-db}:${DATABASE_PORT:-5432}/${DATABASE_NAME}" \
  -v ON_ERROR_STOP=1 \
  -c "CREATE EXTENSION IF NOT EXISTS citext;"
echo "==> Extensions ready."

echo "==> Waiting for Redis..."
until redis-cli -h "${REDIS_HOST:-redis}" -p "${REDIS_PORT:-6379}" ping >/dev/null 2>&1
do
  sleep 1
done
echo "==> Redis ready."

echo "==> Running migrations..."
flask db upgrade
echo "==> Migrations done."

if [ "${SEED_DATA:-0}" = "1" ]; then
  echo "==> Seeding..."
  # If you have 'seed all', prefer it:
  # flask seed all
  flask seed rbac
  flask seed core
  flask seed university
  echo "==> Seeding done."
else
  echo "==> Seeding skipped (SEED_DATA=${SEED_DATA:-0})."
fi

echo "==> Starting backend..."
exec gunicorn -b 0.0.0.0:7000 --reload "cmcp.wsgi:app"
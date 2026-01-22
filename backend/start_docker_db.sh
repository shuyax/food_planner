#!/bin/bash
set -e  # exit if any command fails

# --- Start Dev DB ---
set -a
source .env.dev
set +a
name="foodplanner-dev-db"
echo "Starting Dev DB: $DB_NAME on port $DB_PORT..."
if docker ps -a --format '{{.Names}}' | grep -q "^$name$"; then
    echo "Container $name already exists. Starting..."
    docker start "$name"
else
    echo "Creating and starting $name..."
    docker run -d \
        --name "$name" \
        -e POSTGRES_DB="$DB_NAME" \
        -e POSTGRES_USER="$DB_USER" \
        -e POSTGRES_PASSWORD="$DB_PASSWORD" \
        -p "$DB_PORT":5432 \
        -v foodplanner_dev_data:/var/lib/postgresql/data \
        postgres:16
fi    

# Wait until Dev Postgres is ready
echo "Waiting for $name to be ready..."
until docker exec "$name" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; do
    sleep 1
done
echo "✅ $name ready!"
unset POSTGRES_DB DB_USER DB_PASSWORD DB_PORT

# --- Start Test DB ---
set -a
source .env.test
set +a
name="foodplanner-test-db"
echo "Starting Test DB: $DB_NAME on port $DB_PORT..."
if docker ps -a --format '{{.Names}}' | grep -q "^$name$"; then
    echo "Container $name already exists. Starting..."
    docker start "$name"
else
    echo "Creating and starting $name..."
    docker run -d \
        --name "$name" \
        -e POSTGRES_DB="$DB_NAME" \
        -e POSTGRES_USER="$DB_USER" \
        -e POSTGRES_PASSWORD="$DB_PASSWORD" \
        -p "$DB_PORT":5432 \
        -v foodplanner_test_data:/var/lib/postgresql/data \
        postgres:16
fi

# Wait until Test Postgres is ready
echo "Waiting for $name to be ready..."
until docker exec "$name" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; do
    sleep 1
done
echo "✅ $name ready!"
unset POSTGRES_DB DB_USER DB_PASSWORD DB_PORT

echo "🎉 All databases started successfully."

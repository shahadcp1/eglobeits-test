#!/bin/sh
set -e

# Function to wait for the database to be ready
wait_for_db() {
  echo "Waiting for database to be ready..."
  until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' >/dev/null 2>&1; do
    echo "Waiting for database connection..."
    sleep 1
  done
  echo "Database is ready!"
}

# Run database migrations
run_migrations() {
  echo "Running database migrations..."
  npx prisma migrate deploy
  echo "Migrations completed!"
}

# Main execution
if [ "$1" = 'start' ]; then
  # Wait for the database to be ready
  wait_for_db
  
  # Run migrations
  run_migrations
  
  # Start the application
  exec node dist/server.js
else
  # If the command is not 'start', execute it directly (useful for debugging)
  exec "$@"
fi

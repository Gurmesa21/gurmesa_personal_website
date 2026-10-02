#!/bin/bash
# Restore the PostgreSQL database
# Usage: ./scripts/restore-db.sh <backup_file.sql.gz> [TARGET_DATABASE_URL]
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file.sql.gz> [TARGET_DATABASE_URL]"
  exit 1
fi

BACKUP_FILE=$1
TARGET_URL=${2:-$DATABASE_URL}

if [ -f .env ] && [ -z "$TARGET_URL" ]; then
  export $(cat .env | grep -v '^#' | awk '/=/ {print $1}')
  TARGET_URL=$DATABASE_URL
fi

if [ -z "$TARGET_URL" ]; then
  echo "Error: Target DATABASE_URL is not set."
  exit 1
fi

echo "Restoring database from $BACKUP_FILE to $TARGET_URL..."
gunzip -c "$BACKUP_FILE" | psql "$TARGET_URL"

echo "Restore completed successfully."

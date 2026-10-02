#!/bin/bash
# Backup the PostgreSQL database
# Usage: ./scripts/backup-db.sh
set -e

# Load environment variables from .env if present
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | awk '/=/ {print $1}')
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set."
  exit 1
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "Backing up database to $BACKUP_FILE..."
# pg_dump requires postgresql-client installed on the system
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"

echo "Backup completed successfully: $BACKUP_FILE"

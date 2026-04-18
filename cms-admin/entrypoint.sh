#!/bin/sh
set -e

echo "=== Alfa Invest CMS Admin — Starting ==="

# Run database migrations before starting the server
echo "Running database migrations..."
node --input-type=module <<'EOF'
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";

const db = drizzle(process.env.DATABASE_URL);
try {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations complete");
} catch (err) {
  console.error("WARNING: Migration failed:", err.message);
  console.error("Attempting to continue anyway...");
} finally {
  process.exit(0);
}
EOF

echo "Starting server..."
exec node dist/index.js

import postgres from "postgres";

const sql = postgres("postgresql://postgres:postgres@localhost:5432/postgres");
try {
  const r = await sql`SELECT 1 AS ok`;
  console.log("Connected to PostgreSQL:", r);
  
  // Check if aqarize DB exists
  const dbs = await sql`SELECT datname FROM pg_database WHERE datname = 'aqarize'`;
  console.log("Database aqarize exists:", dbs.length > 0);
  
  if (dbs.length === 0) {
    console.log("Creating database aqarize...");
    await sql`CREATE DATABASE aqarize`;
    console.log("Database aqarize created successfully");
  }
  
  await sql.end();
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
}

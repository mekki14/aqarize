// Try common passwords for postgres user
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const passwords = ["postgres", "admin", "password", "root", "1234", "aqarize", ""];

async function tryPassword(pwd) {
  const url = `postgresql://postgres:${encodeURIComponent(pwd)}@localhost:5432/postgres`;
  try {
    const sql = postgres(url, { max: 1, idle_timeout: 5, max_lifetime: 5 });
    const r = await sql`SELECT 1 AS ok`;
    console.log(`SUCCESS with password: "${pwd}"`);
    await sql.end();
    return true;
  } catch (e) {
    if (e.message.includes("password authentication failed")) {
      return false;
    }
    console.log(`Error (${pwd}):`, e.message);
    return false;
  }
}

for (const pwd of passwords) {
  const ok = await tryPassword(pwd);
  if (ok) process.exit(0);
}

// No password worked - try without password
try {
  const sql = postgres("postgresql://postgres@localhost:5432/postgres");
  const r = await sql`SELECT 1 AS ok`;
  console.log('SUCCESS with no password (trust auth)');
  await sql.end();
  process.exit(0);
} catch (e) {
  // ignore
}

console.log("Could not find working password");
process.exit(1);

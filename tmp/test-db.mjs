import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL);
try {
  const r = await sql`SELECT 1 AS connected`;
  console.log("OK:", JSON.stringify(r));
  await sql.end();
  process.exit(0);
} catch (e) {
  console.error("FAIL:", e.message);
  process.exit(1);
}

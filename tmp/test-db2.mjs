import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL);
try {
  const tables = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `;
  console.log("Tables:", tables.map(t => t.table_name).join(", "));
  
  const r = await sql`SELECT 1 AS connected`;
  console.log("Connection OK:", JSON.stringify(r));
  await sql.end();
  process.exit(0);
} catch (e) {
  console.error("FAIL:", e.message);
  process.exit(1);
}

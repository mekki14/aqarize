require('dotenv').config({ path: '.env.local' });
const p = require('postgres');
(async () => {
  try {
    const sql = p(process.env.DATABASE_URL);
    const r = await sql`SELECT 1 as test`;
    console.log('DB connected:', r[0].test);
    const result = await sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')`;
    console.log('Users table exists:', result[0].exists);
    await sql.end();
  } catch(e) {
    console.error('DB error:', e.message);
  }
})();

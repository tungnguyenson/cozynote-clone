/**
 * Apply the initial schema using Supabase's rpc endpoint.
 * Run: node scripts/apply-schema.mjs
 *
 * Note: This requires a service_role key. If unavailable,
 * paste supabase/migrations/001_initial_schema.sql into the
 * Supabase SQL Editor at https://supabase.com/dashboard
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  join(__dirname, '../supabase/migrations/001_initial_schema.sql'),
  'utf8'
);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://syzyagwwhjwfwjfmgrpy.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('⚠️  No SUPABASE_SERVICE_ROLE_KEY set.');
  console.error('   Apply the schema manually via Supabase SQL Editor:');
  console.error('   https://supabase.com/dashboard/project/syzyagwwhjwfwjfmgrpy/sql/new');
  console.error('\n   File: supabase/migrations/001_initial_schema.sql');
  process.exit(1);
}

const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  },
  body: JSON.stringify({ query: sql }),
});

if (res.ok) {
  console.log('✅ Schema applied successfully');
} else {
  const err = await res.text();
  console.error('❌ Failed:', err);
}

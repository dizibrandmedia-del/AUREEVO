const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');

const localDb = new PrismaClient();

const turso = createClient({
  url: 'libsql://aurevo-dizibrandmedia-del.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTAxMDQyMDksImlkIjoiMDFhMGNhODYtMmIwMS03MTJjLWI1YTYtMDMxZjNkOWUzZmQ5Iiwia2lkIjoibXpldXhwVzJ0aDZNUG1KVzRxQlB6LUhCTHlMaWw0VXVOX2dCeUJoQTQzWSIsInJpZCI6IjE5YjVkYjYyLTc0NjQtNDQxOS1hNjRhLWQ5YTZmOTM1ZDkwMiJ9.rNllR5H5zSYS58o_PGw-IgJRS49MGreKioPh-D6L48dOJNKfDNlGkF3EOpOdL0HTmKAnNb5RJ5VY87BJkySeAA'
});

async function sync() {
  console.log('--- 1. CONNECTING TO LOCAL SQLITE & TURSO ---');

  // Test Turso connection
  const ping = await turso.execute('SELECT 1 + 1 AS ok');
  console.log('Turso ping:', ping.rows);

  // Get all table creation statements from local SQLite
  const schemaObjects = await localDb.$queryRawUnsafe(
    "SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%' ORDER BY type = 'table' DESC, name ASC"
  );

  console.log(`Found ${schemaObjects.length} schema objects (tables & indexes) in local SQLite.`);

  // Create tables in Turso
  console.log('\n--- 2. CREATING TABLES & INDEXES ON TURSO ---');
  for (const obj of schemaObjects) {
    try {
      await turso.execute(obj.sql);
      console.log(`[CREATED ${obj.type.toUpperCase()}] ${obj.name}`);
    } catch (err) {
      if (err.message && err.message.includes('already exists')) {
        console.log(`[EXISTS] ${obj.name}`);
      } else {
        console.error(`[ERROR creating ${obj.name}]:`, err.message);
      }
    }
  }

  // Get table names
  const tables = schemaObjects.filter(o => o.type === 'table').map(o => o.name);

  // In SQLite, disable foreign keys temporarily to insert in any order
  await turso.execute('PRAGMA foreign_keys = OFF');

  console.log('\n--- 3. COPYING DATA TO TURSO ---');
  for (const table of tables) {
    const rows = await localDb.$queryRawUnsafe(`SELECT * FROM "${table}"`);
    if (rows.length === 0) {
      console.log(`[EMPTY] ${table} (0 rows)`);
      continue;
    }

    console.log(`[COPYING] ${table} (${rows.length} rows)...`);
    
    // Insert rows in batches
    for (const row of rows) {
      const columns = Object.keys(row);
      const placeholders = columns.map(() => '?').join(', ');
      const sql = `INSERT OR REPLACE INTO "${table}" ("${columns.join('", "')}") VALUES (${placeholders})`;
      
      const values = columns.map(col => {
        const val = row[col];
        if (val instanceof Date) {
          return val.toISOString();
        }
        if (typeof val === 'boolean') {
          return val ? 1 : 0;
        }
        return val;
      });

      try {
        await turso.execute({ sql, args: values });
      } catch (err) {
        console.error(`Error inserting into ${table}:`, err.message);
      }
    }
    console.log(`[DONE] ${table}`);
  }

  await turso.execute('PRAGMA foreign_keys = ON');

  console.log('\n--- 4. VERIFYING COUNTS ON TURSO ---');
  for (const table of tables) {
    try {
      const res = await turso.execute(`SELECT COUNT(*) AS c FROM "${table}"`);
      console.log(`${table}: ${res.rows[0].c} rows`);
    } catch (e) {
      console.error(`Error counting ${table}:`, e.message);
    }
  }

  console.log('\n✅ TURSO DATABASE SYNC COMPLETE!');
}

sync()
  .catch(console.error)
  .finally(async () => {
    await localDb.$disconnect();
  });

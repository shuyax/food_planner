// database/migrate.js
const fs = require("fs");
const path = require("path");
const pool = require("./pool.js");
console.log('process.env.NODE_ENV', process.env.NODE_ENV)

const isTest = process.env.NODE_ENV === "test";
const isDev = process.env.NODE_ENV === "development";
const isProd = process.env.NODE_ENV === "production";

const runSQLFile = async (filePath) => {
  const sql = fs.readFileSync(filePath, "utf8");
  await pool.query(sql);
  console.log(`Executed ${path.basename(filePath)}`);
};
// Reset database only for test/dev
const resetDatabase = async () => {
  if (isTest || isDev) {
    console.log(`♻️ Resetting ${process.env.NODE_ENV} database...`);
    await pool.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
    `);
  } else if (isProd) {
    console.log("✅ Production environment: skipping database reset");
  } else {
    throw new Error("❌ Refusing to reset DB outside pre-defined environment");
  }
};

// Check if schema exists in production
const prodMigrationNeeded = async () => {
  if (!isProd) return true; // always run resetDatabase for dev/test

  const result = await pool.query(`
    SELECT schema_name 
    FROM information_schema.schemata 
    WHERE schema_name='public';
  `);
  // If public schema exists and has tables, skip reset
  const tables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public';
  `);
  return tables.rowCount === 0; // migrate if no tables exist
};

const runMigrations = async () => {
    if (isProd) {
      const shouldMigrate = await prodMigrationNeeded();
      if (!shouldMigrate) {
        console.log("Production database already exists. Skipping schema reset.");
      } else {
        console.log("Production database is empty. Running migrations...");
      }
    }
    await resetDatabase(); // will skip for prod if DB already exists
    // Run migrations only if dev/test OR prod needs migration
    const shouldRunMigrations = isDev || isTest || (isProd && (await prodMigrationNeeded()));
    if (shouldRunMigrations) {
      const basePath = path.resolve(__dirname);
      await runSQLFile(path.join(basePath, "schema.sql"));
      await runSQLFile(path.join(basePath, "triggers.sql"));
      await runSQLFile(path.join(basePath, "seed.sql"));
      if (isDev) {
        console.log('Inserting dev_seed data...');
        await runSQLFile(path.join(basePath, "dev_seed.sql"));
      }
    }
    console.log("Database migration completed successfully.");
};

module.exports = { runMigrations };

if (require.main === module) {
  (async () => {
    try {
      await runMigrations();
      process.exit(0);
    } catch (err) {
      console.error("Migration error:", err);
      process.exit(1);
    }
  })();
}


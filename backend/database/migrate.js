// database/migrate.js
const fs = require("fs");
const path = require("path");
const { getPool, LoggingPool } = require("./pool.js");
console.log('process.env.NODE_ENV', process.env.NODE_ENV)

const isTest = process.env.NODE_ENV === "test";
const isDev = process.env.NODE_ENV === "development";
const isProd = process.env.NODE_ENV === "production";

const runSQLFile = async (pool, filePath) => {
  const sql = fs.readFileSync(filePath, "utf8");
  await pool.query(sql);
  console.log(`Executed ${path.basename(filePath)}`);
};
// Reset database only for test/dev
const resetDatabase = async () => {
  if (isTest || isDev) {
    console.log(`♻️ Resetting ${process.env.NODE_ENV} database...`);
    const tempPool = LoggingPool.temp({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });
    await tempPool.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
    `);
    return tempPool; // return temp pool for migrations
  } else if (isProd) {
    console.log("✅ Production environment: skipping database reset");
    return getPool();
  } else {
    throw new Error("❌ Refusing to reset DB outside pre-defined environment");
  }
};

// Check if schema exists in production
const prodMigrationNeeded = async (pool) => {
  if (!isProd) return true; // always run resetDatabase for dev/test
  // If public schema exists and has tables, skip reset
  const tables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public';
  `);
  return tables.rowCount === 0; // migrate if no tables exist
};

const runMigrations = async () => {
    console.log(`♻️ Running migrations for ${process.env.NODE_ENV}...`);
    let pool = getPool();
    let shouldRunMigrations = true;
    if (isProd) {
      const prodCheck = await prodMigrationNeeded(pool);
      if (!prodCheck) {
        console.log("Production database already exists. Skipping schema reset.");
        shouldRunMigrations = false;
      } else {
        console.log("Production database is empty. Running migrations...");
      }
    }
    // Reset DB for dev/test
    if (isDev || isTest) {
      pool = await resetDatabase(); // get fresh pool
    }
    // Run migrations only if dev/test OR prod needs migration
    if (shouldRunMigrations || isDev || isTest) {
      const basePath = path.resolve(__dirname);
      await runSQLFile(pool, path.join(basePath, "schema.sql"));
      await runSQLFile(pool, path.join(basePath, "triggers.sql"));
      await runSQLFile(pool, path.join(basePath, "seed.sql"));
      if (isDev) {
        console.log('Inserting dev_seed data...');
        await runSQLFile(pool, path.join(basePath, "dev_seed.sql"));
      }
    }
    console.log("Database migration completed successfully.");
};

module.exports = { runMigrations };

if (require.main === module) {
  (async () => {
    try {
      await runMigrations();
      // cleanly close all connections before exiting
      await getPool().end();
      process.exit(0);
    } catch (err) {
      console.error("Migration error:", err);
      // also try closing pool in case of error
      try { await getPool().end(); } catch (_) {}
      process.exit(1);
    }
  })();
}


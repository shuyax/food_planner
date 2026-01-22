// database/migrate.js
const fs = require("fs");
const path = require("path");
const pool = require("./pool.js");

const isTest = process.env.NODE_ENV === "test";
const isDev = process.env.NODE_ENV === "development";

const runSQLFile = async (filePath) => {
  const sql = fs.readFileSync(filePath, "utf8");
  await pool.query(sql);
  console.log(`Executed ${path.basename(filePath)}`);
};

const resetDatabase = async () => {
  if (!isTest && !isDev) {
    throw new Error("❌ Refusing to reset DB outside test environment");
  }
  console.log("♻️ Resetting test database...");
  await pool.query(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
  `);
};

(async () => {
  try {
    const basePath = path.resolve(__dirname);
    await resetDatabase();
    // run schema.sql first
    await runSQLFile(path.join(basePath, "schema.sql"));

    // run triggers.sql second
    await runSQLFile(path.join(basePath, "triggers.sql"));

    // run seed.sql third populate the pre-set table
    await runSQLFile(path.join(basePath, "seed.sql"));
    if (isDev) {
      console.log('inserting dev_seed data');
      await runSQLFile(path.join(basePath, "dev_seed.sql"));
    };

    console.log("Database migration completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
})();

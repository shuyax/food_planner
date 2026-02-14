const { Pool } = require("pg");
const path = require("path");
const dotenv = require("dotenv");
const envMap = {
  test: ".env.test",
  development: ".env.dev",
  production: ".env.prod",
};
const envFileName = envMap[process.env.NODE_ENV] || ".env.dev";
const envFile = path.resolve(__dirname, `../${envFileName}`);
dotenv.config({ path: envFile, override: true });

console.log("💡 Connecting with DB config:", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Optional but VERY helpful during debugging
pool.on("connect", () => {
  console.log(
    `🗄️ Connected to ${process.env.NODE_ENV} database: ${process.env.DB_NAME}`
  );
});

pool.on("error", (err) => {
  console.error("Unexpected PG pool error", err);
  process.exit(1);
});

module.exports = pool;
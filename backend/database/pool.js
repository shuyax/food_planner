const { Pool } = require("pg");
const path = require("path");
const dotenv = require("dotenv");
const envFile =
  process.env.NODE_ENV === "test"
    ? path.resolve(__dirname, "../.env.test")
    : path.resolve(__dirname, "../.env.dev");
dotenv.config({ path: envFile, override: true });

const isTest = process.env.NODE_ENV === "test";

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
    `🗄️ Connected to ${isTest ? "TEST" : "DEV"} database: ${process.env.DB_NAME}`
  );
});

pool.on("error", (err) => {
  console.error("Unexpected PG pool error", err);
  process.exit(1);
});

module.exports = pool;
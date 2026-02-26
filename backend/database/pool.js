const { Pool } = require("pg");

class LoggingPool extends Pool {
  constructor(config) {
    super(config);

    // Log when a connection is established
    this.on('connect', () => {
      console.log(
        `🗄️ Connected to ${process.env.NODE_ENV} database: ${process.env.DB_NAME}`
      );
    });

    // Log any errors
    this.on('error', (err) => {
      console.error('❌ Unexpected PG pool error:', err);
    });
  }

  // You can also override query to log query errors
  async query(text, params) {
    try {
      return await super.query(text, params);
    } catch (err) {
      console.error('❌ Query error:', err, 'SQL:', text, 'Params:', params);
      throw err; // rethrow so caller knows
    }
  }
   // Create a temporary pool for migrations / resets
  static temp(config) {
    return new LoggingPool(config);
  }
}

let pool;
function createPool() {
  pool = new LoggingPool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
  return pool;
}

function getPool() {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

module.exports = { getPool, LoggingPool };


const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const config = {
  port: Number(process.env.PORT) || 5000,
  server: {
    startupRetryDelayMs:
      Number(process.env.STARTUP_RETRY_DELAY_MS) || 5000,
  },
  db: {
    connectionString:
      process.env.DATABASE_URL ||
      'postgres://postgres:password@localhost:5433/password_demo',
  },
  cracking: {
    workerTimeoutMs: Number(process.env.WORKER_TIMEOUT_MS) || 120000,
    maxConcurrentJobs: Number(process.env.MAX_CONCURRENT_JOBS) || 2,
  },
};

module.exports = config;



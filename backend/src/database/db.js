const { Pool } = require('pg');
const config = require('../config/env');

const pool = new Pool({
  connectionString: config.db.connectionString,
});

// Prevent pool errors from crashing the process
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  // Don't exit - just log the error
});

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      hash TEXT NOT NULL,
      algorithm TEXT NOT NULL,
      salt TEXT,
      params JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS crack_jobs (
      id UUID PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      attack_type TEXT NOT NULL,
      wordlist TEXT,
      max_length INTEGER,
      charset TEXT,
      status TEXT NOT NULL,
      started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      finished_at TIMESTAMP WITH TIME ZONE,
      total_time_ms INTEGER,
      attempts BIGINT DEFAULT 0,
      attempts_per_sec DOUBLE PRECISION,
      found_password TEXT
    );
  `);
};

const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query,
  initDb,
};



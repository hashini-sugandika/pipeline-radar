const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pipeline_runs (
      id SERIAL PRIMARY KEY,
      repo_name VARCHAR(255) NOT NULL,
      workflow_name VARCHAR(255) NOT NULL,
      run_id BIGINT UNIQUE NOT NULL,
      status VARCHAR(50) NOT NULL,
      conclusion VARCHAR(50),
      branch VARCHAR(255),
      commit_sha VARCHAR(255),
      triggered_by VARCHAR(255),
      started_at TIMESTAMP,
      completed_at TIMESTAMP,
      duration_seconds INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS pipeline_steps (
      id SERIAL PRIMARY KEY,
      run_id BIGINT REFERENCES pipeline_runs(run_id),
      step_name VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL,
      conclusion VARCHAR(50),
      started_at TIMESTAMP,
      completed_at TIMESTAMP,
      duration_seconds INTEGER
    );
  `);
  console.log('Database initialized');
};

module.exports = { pool, initDB };

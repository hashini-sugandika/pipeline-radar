const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pipeline_analysis (
      id SERIAL PRIMARY KEY,
      run_id BIGINT NOT NULL,
      repo_name VARCHAR(255) NOT NULL,
      pattern VARCHAR(255),
      severity VARCHAR(50),
      message TEXT,
      suggestions TEXT[],
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('Analysis DB initialized');
};

module.exports = { pool, initDB };

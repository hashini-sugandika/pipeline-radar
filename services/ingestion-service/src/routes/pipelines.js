const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { getCache, setCache } = require('../redis');

router.get('/', async (req, res) => {
  try {
    const cached = await getCache('pipelines:all');
    if (cached) return res.json(cached);

    const result = await pool.query(`
      SELECT * FROM pipeline_runs
      ORDER BY created_at DESC
      LIMIT 50
    `);

    await setCache('pipelines:all', result.rows, 30);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_runs,
        COUNT(*) FILTER (WHERE conclusion = 'success') as successful,
        COUNT(*) FILTER (WHERE conclusion = 'failure') as failed,
        ROUND(AVG(duration_seconds)) as avg_duration,
        COUNT(DISTINCT repo_name) as total_repos
      FROM pipeline_runs
      WHERE created_at > NOW() - INTERVAL '7 days'
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:repoName', async (req, res) => {
  try {
    const repo = decodeURIComponent(req.params.repoName);
    const result = await pool.query(`
      SELECT * FROM pipeline_runs
      WHERE repo_name = $1
      ORDER BY created_at DESC
      LIMIT 20
    `, [repo]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


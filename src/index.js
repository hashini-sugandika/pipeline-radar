require('dotenv').config();
const express = require('express');
const { initDB, pool } = require('./db');
const { subscriber, connectRedis, publishEvent } = require('./redis');
const { analyzeRun } = require('./analyzers/failurePatterns');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'analysis-service' });
});

app.get('/analysis/:repoName', async (req, res) => {
  try {
    const repo = decodeURIComponent(req.params.repoName);
    const result = await pool.query(`
      SELECT * FROM pipeline_analysis
      WHERE repo_name = $1
      ORDER BY created_at DESC
      LIMIT 20
    `, [repo]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/analysis/summary/critical', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT repo_name, pattern, severity, message, suggestions, created_at
      FROM pipeline_analysis
      WHERE severity = 'critical'
      AND created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const startSubscriber = async () => {
  await subscriber.subscribe('pipeline:events', async (message) => {
    const eventData = JSON.parse(message);
    console.log(`Analyzing event for ${eventData.repo} - ${eventData.conclusion}`);

    const patterns = await analyzeRun(eventData);

    if (patterns && patterns.length > 0) {
      for (const pattern of patterns) {
        await pool.query(`
          INSERT INTO pipeline_analysis
            (run_id, repo_name, pattern, severity, message, suggestions)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          eventData.runId,
          eventData.repo,
          pattern.pattern,
          pattern.severity,
          pattern.message,
          pattern.suggestions
        ]);

        await publishEvent('analysis:alerts', {
          ...pattern,
          repo: eventData.repo,
          runId: eventData.runId,
          timestamp: new Date().toISOString()
        });

        console.log(`Pattern detected: ${pattern.pattern} (${pattern.severity})`);
      }
    }
  });

  console.log('Subscribed to pipeline:events');
};

const start = async () => {
  try {
    await connectRedis();
    await initDB();
    await startSubscriber();
    app.listen(PORT, () => {
      console.log(`Analysis service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
};

start();

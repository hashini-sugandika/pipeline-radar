const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { publishEvent, setCache } = require('../redis');
const validateWebhook = require('../middleware/validateWebhook');

router.post('/github', validateWebhook, async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  try {
    if (event === 'workflow_run') {
      await handleWorkflowRun(payload);
    }
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Processing failed' });
  }
});

const handleWorkflowRun = async (payload) => {
  const run = payload.workflow_run;
  const repo = payload.repository;

  const startedAt = run.run_started_at ? new Date(run.run_started_at) : null;
  const completedAt = run.updated_at ? new Date(run.updated_at) : null;
  const duration = startedAt && completedAt
    ? Math.floor((completedAt - startedAt) / 1000)
    : null;

  await pool.query(`
    INSERT INTO pipeline_runs
      (repo_name, workflow_name, run_id, status, conclusion,
       branch, commit_sha, triggered_by, started_at, completed_at, duration_seconds)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    ON CONFLICT (run_id) DO UPDATE SET
      status = EXCLUDED.status,
      conclusion = EXCLUDED.conclusion,
      completed_at = EXCLUDED.completed_at,
      duration_seconds = EXCLUDED.duration_seconds
  `, [
    repo.full_name,
    run.name,
    run.id,
    run.status,
    run.conclusion,
    run.head_branch,
    run.head_sha,
    run.triggering_actor?.login,
    startedAt,
    completedAt,
    duration
  ]);

  const eventData = {
    type: 'workflow_run',
    repo: repo.full_name,
    workflow: run.name,
    runId: run.id,
    status: run.status,
    conclusion: run.conclusion,
    branch: run.head_branch,
    duration,
    timestamp: new Date().toISOString()
  };

  await publishEvent('pipeline:events', eventData);
  await setCache(`run:${run.id}`, eventData);

  console.log(`Processed run ${run.id} for ${repo.full_name} - ${run.status}`);
};

module.exports = router;

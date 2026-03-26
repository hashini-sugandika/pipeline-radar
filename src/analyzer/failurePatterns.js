const { pool } = require('../db');

const analyzeRun = async (eventData) => {
  const { runId, repo, conclusion, duration, workflow } = eventData;

  if (conclusion !== 'failure' && conclusion !== 'timed_out') return null;

  const patterns = [];

  const recentRuns = await pool.query(`
    SELECT conclusion, duration_seconds, branch
    FROM pipeline_runs
    WHERE repo_name = $1
    AND workflow_name = $2
    ORDER BY created_at DESC
    LIMIT 5
  `, [repo, workflow]);

  const failures = recentRuns.rows.filter(r => r.conclusion === 'failure');
  const consecutiveFailures = failures.length;

  if (consecutiveFailures >= 3) {
    patterns.push({
      pattern: 'consecutive_failures',
      severity: 'critical',
      message: `${workflow} has failed ${consecutiveFailures} times in a row`,
      suggestions: [
        'Check recent commits for breaking changes',
        'Review test environment stability',
        'Consider reverting the last merge'
      ]
    });
  }

  if (conclusion === 'timed_out') {
    patterns.push({
      pattern: 'timeout',
      severity: 'warning',
      message: `${workflow} timed out after ${duration}s`,
      suggestions: [
        'Check for infinite loops or hanging processes',
        'Consider increasing timeout limits',
        'Review resource-intensive steps'
      ]
    });
  }

  const avgDuration = await pool.query(`
    SELECT AVG(duration_seconds) as avg
    FROM pipeline_runs
    WHERE repo_name = $1
    AND workflow_name = $2
    AND conclusion = 'success'
    AND created_at > NOW() - INTERVAL '7 days'
  `, [repo, workflow]);

  const avg = parseFloat(avgDuration.rows[0].avg);
  if (avg && duration > avg * 2) {
    patterns.push({
      pattern: 'slow_build',
      severity: 'warning',
      message: `Build took ${duration}s, which is ${Math.round(duration/avg)}x longer than average (${Math.round(avg)}s)`,
      suggestions: [
        'Check for dependency installation slowdowns',
        'Consider caching dependencies',
        'Review if new steps were added recently'
      ]
    });
  }

  return patterns;
};

module.exports = { analyzeRun };

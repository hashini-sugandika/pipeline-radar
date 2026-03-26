import React from 'react';

function StatsBar({ stats }) {
  if (!stats) return null;

  const successRate = stats.total_runs > 0
    ? Math.round((stats.successful / stats.total_runs) * 100)
    : 0;

  return (
    <div className="stats-bar">
      <div className="stat-card">
        <div className="stat-value">{stats.total_runs}</div>
        <div className="stat-label">Total Runs</div>
      </div>
      <div className="stat-card success">
        <div className="stat-value">{stats.successful}</div>
        <div className="stat-label">Successful</div>
      </div>
      <div className="stat-card danger">
        <div className="stat-value">{stats.failed}</div>
        <div className="stat-label">Failed</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{successRate}%</div>
        <div className="stat-label">Success Rate</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.avg_duration || 0}s</div>
        <div className="stat-label">Avg Duration</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.total_repos}</div>
        <div className="stat-label">Repos Monitored</div>
      </div>
    </div>
  );
}

export default StatsBar;

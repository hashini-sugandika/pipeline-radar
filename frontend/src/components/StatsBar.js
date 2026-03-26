import React from 'react';

function StatsBar({ stats }) {
  if (!stats) return null;

  const successRate = stats.total_runs > 0
    ? Math.round((stats.successful / stats.total_runs) * 100)
    : 0;

  const rateColor = successRate >= 80 ? 'success' : successRate >= 50 ? '' : 'danger';

  return (
    <div className="stats-bar">
      <div className="stat-card">
        <div className="stat-icon">pipeline</div>
        <div className="stat-value">{stats.total_runs}</div>
        <div className="stat-label">Total Runs</div>
        <div className="stat-trend">Last 7 days</div>
      </div>
      <div className="stat-card success">
        <div className="stat-icon">check</div>
        <div className="stat-value">{stats.successful}</div>
        <div className="stat-label">Successful</div>
        <div className="stat-trend">Passed</div>
      </div>
      <div className="stat-card danger">
        <div className="stat-icon">x</div>
        <div className="stat-value">{stats.failed}</div>
        <div className="stat-label">Failed</div>
        <div className="stat-trend">Needs attention</div>
      </div>
      <div className={`stat-card ${rateColor}`}>
        <div className="stat-icon">%</div>
        <div className="stat-value">{successRate}%</div>
        <div className="stat-label">Success Rate</div>
        <div className="stat-trend">{successRate >= 80 ? 'Healthy' : successRate >= 50 ? 'Degraded' : 'Critical'}</div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">t</div>
        <div className="stat-value">{stats.avg_duration || 0}s</div>
        <div className="stat-label">Avg Duration</div>
        <div className="stat-trend">Per run</div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">r</div>
        <div className="stat-value">{stats.total_repos}</div>
        <div className="stat-label">Repos</div>
        <div className="stat-trend">Monitored</div>
      </div>
    </div>
  );
}

export default StatsBar;

import React from 'react';

const SEVERITY_COLORS = {
  critical: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6'
};

function AlertsFeed({ alerts }) {
  return (
    <div className="card">
      <h2 className="card-title">Alerts Feed</h2>
      {alerts.length === 0 ? (
        <div className="empty">No alerts yet.</div>
      ) : (
        <div className="alerts-list">
          {[...alerts].reverse().map((alert, i) => (
            <div key={i} className="alert-item" style={{
              borderLeft: `3px solid ${SEVERITY_COLORS[alert.severity] || '#6b7280'}`
            }}>
              <div className="alert-header">
                <span className="alert-severity" style={{
                  color: SEVERITY_COLORS[alert.severity] || '#6b7280'
                }}>
                  {alert.severity?.toUpperCase()}
                </span>
                <span className="alert-repo">{alert.repo}</span>
              </div>
              <div className="alert-message">{alert.message}</div>
              {alert.suggestions && (
                <div className="alert-suggestions">
                  {alert.suggestions.slice(0, 2).map((s, j) => (
                    <div key={j} className="alert-suggestion">→ {s}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlertsFeed;

import React from 'react';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  return `${Math.floor(diff/3600)}h ago`;
};

function AlertsFeed({ alerts }) {
  const sorted = [...alerts].reverse();

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="card-title-icon">&#9888;</span>
          Alerts Feed
        </div>
        <span className="card-count">{alerts.length}</span>
      </div>
      <div className="card-body">
        {sorted.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">&#10003;</div>
            <div className="empty-text">No alerts detected.<br/>All pipelines are healthy.</div>
          </div>
        ) : (
          <div className="alerts-list">
            {sorted.map((alert, i) => (
              <div key={i} className={`alert-item ${alert.severity}`}>
                <div className="alert-header">
                  <span className={`severity-badge ${alert.severity}`}>
                    {alert.severity}
                  </span>
                  <span className="alert-repo">{alert.repo}</span>
                </div>
                <div className="alert-message">{alert.message}</div>
                {alert.suggestions && (
                  <div className="alert-suggestions">
                    {alert.suggestions.slice(0, 2).map((s, j) => (
                      <div key={j} className="alert-suggestion">
                        <span className="suggestion-arrow">&#8594;</span>
                        {s}
                      </div>
                    ))}
                  </div>
                )}
                <div className="alert-time">
                  {formatTime(alert.timestamp || alert.receivedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AlertsFeed;

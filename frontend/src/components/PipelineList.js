import React from 'react';

const getStatusClass = (conclusion, status) => {
  const val = conclusion || status;
  if (val === 'success') return 'success';
  if (val === 'failure') return 'failure';
  if (val === 'cancelled') return 'cancelled';
  if (val === 'in_progress') return 'in_progress';
  return 'default';
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

function PipelineList({ pipelines }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <span className="card-title-icon">&#9654;</span>
          Pipeline Runs
        </div>
        <span className="card-count">{pipelines.length}</span>
      </div>
      <div className="card-body">
        {pipelines.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">&#128268;</div>
            <div className="empty-text">No pipeline runs yet.<br/>Connect a GitHub repo to get started.</div>
          </div>
        ) : (
          <div className="pipeline-list">
            {pipelines.map(run => {
              const statusClass = getStatusClass(run.conclusion, run.status);
              return (
                <div key={run.id} className="pipeline-item">
                  <div className="status-indicator">
                    <div className={`status-dot ${statusClass}`} />
                  </div>
                  <div className="pipeline-info">
                    <div className="pipeline-repo">{run.repo_name}</div>
                    <div className="pipeline-meta">
                      <span className="meta-tag">{run.workflow_name}</span>
                      <span className="meta-tag branch">{run.branch}</span>
                      <span className="meta-tag">by {run.triggered_by}</span>
                      <span className="meta-tag">{formatTime(run.created_at)}</span>
                    </div>
                  </div>
                  <div className="pipeline-right">
                    <span className={`conclusion-badge ${statusClass}`}>
                      {run.conclusion || run.status}
                    </span>
                    <span className="pipeline-duration">
                      {run.duration_seconds ? `${run.duration_seconds}s` : 'running'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PipelineList;

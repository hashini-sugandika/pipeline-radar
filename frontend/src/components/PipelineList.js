import React from 'react';

const STATUS_COLORS = {
  success: '#22c55e',
  failure: '#ef4444',
  cancelled: '#f59e0b',
  in_progress: '#3b82f6',
  queued: '#6b7280',
};

function PipelineList({ pipelines }) {
  return (
    <div className="card">
      <h2 className="card-title">Pipeline Runs</h2>
      {pipelines.length === 0 ? (
        <div className="empty">No pipeline runs yet. Connect a GitHub repo to get started.</div>
      ) : (
        <div className="pipeline-list">
          {pipelines.map(run => (
            <div key={run.id} className="pipeline-item">
              <div className="pipeline-status-dot" style={{
                backgroundColor: STATUS_COLORS[run.conclusion || run.status] || '#6b7280'
              }} />
              <div className="pipeline-info">
                <div className="pipeline-name">{run.repo_name}</div>
                <div className="pipeline-meta">
                  {run.workflow_name} · {run.branch} · by {run.triggered_by}
                </div>
              </div>
              <div className="pipeline-right">
                <div className="pipeline-conclusion" style={{
                  color: STATUS_COLORS[run.conclusion || run.status] || '#6b7280'
                }}>
                  {run.conclusion || run.status}
                </div>
                <div className="pipeline-duration">
                  {run.duration_seconds ? `${run.duration_seconds}s` : '-'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PipelineList;

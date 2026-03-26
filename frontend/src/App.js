import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="header-logo">
            <div className="logo-icon">PR</div>
            <h1>PipelineRadar</h1>
          </div>
          <span className="header-badge">v1.0.0</span>
        </div>
        <div className="header-right">
          <div className="live-indicator">
            <div className="live-dot" />
            Live
          </div>
          <span className="last-updated">
            {time.toLocaleTimeString()}
          </span>
        </div>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;

import React from 'react';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>PipelineRadar</h1>
          <span className="header-subtitle">CI/CD Observability Platform</span>
        </div>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;

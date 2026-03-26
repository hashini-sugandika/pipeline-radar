import React, { useState, useEffect, useCallback } from 'react';
import StatsBar from '../components/StatsBar';
import PipelineList from '../components/PipelineList';
import AlertsFeed from '../components/AlertsFeed';
import axios from 'axios';

const INGESTION_URL = 'http://localhost:3001';
const ALERTS_URL = 'http://localhost:3003';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [pipelines, setPipelines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, pipelinesRes, alertsRes] = await Promise.all([
        axios.get(`${INGESTION_URL}/pipelines/stats`),
        axios.get(`${INGESTION_URL}/pipelines`),
        axios.get(`${ALERTS_URL}/alerts`)
      ]);
      setStats(statsRes.data);
      setPipelines(pipelinesRes.data);
      setAlerts(alertsRes.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) return (
    <div className="loading">
      <div className="loading-spinner" />
      <span>Connecting to PipelineRadar...</span>
    </div>
  );

  return (
    <div className="dashboard">
      <StatsBar stats={stats} lastUpdated={lastUpdated} />
      <div className="dashboard-grid">
        <PipelineList pipelines={pipelines} />
        <AlertsFeed alerts={alerts} />
      </div>
    </div>
  );
}

export default Dashboard;

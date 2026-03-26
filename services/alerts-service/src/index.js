require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { subscriber, connectRedis } = require('./redis');
const { sendSlackAlert } = require('./notifiers/slack');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

const alertHistory = [];

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'alerts-service' });
});

app.get('/alerts', (req, res) => {
  res.json(alertHistory.slice(-50));
});

app.get('/alerts/stats', (req, res) => {
  const critical = alertHistory.filter(a => a.severity === 'critical').length;
  const warning = alertHistory.filter(a => a.severity === 'warning').length;
  res.json({
    total: alertHistory.length,
    critical,
    warning,
    last_alert: alertHistory[alertHistory.length - 1] || null
  });
});

const startSubscriber = async () => {
  await subscriber.subscribe('analysis:alerts', async (message) => {
    const alertData = JSON.parse(message);
    console.log(`Alert received: ${alertData.pattern} (${alertData.severity}) for ${alertData.repo}`);

    alertHistory.push({
      ...alertData,
      receivedAt: new Date().toISOString()
    });

    try {
      await sendSlackAlert(alertData);
    } catch (err) {
      console.error('Failed to send alert:', err.message);
    }
  });

  console.log('Subscribed to analysis:alerts');
};

const start = async () => {
  try {
    await connectRedis();
    await startSubscriber();
    app.listen(PORT, () => {
      console.log(`Alerts service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
};

start();

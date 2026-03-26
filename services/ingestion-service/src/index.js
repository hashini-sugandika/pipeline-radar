require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');
const { connectRedis } = require('./redis');
const webhookRoutes = require('./routes/webhook');
const pipelineRoutes = require('./routes/pipelines');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ingestion-service' });
});

app.use('/webhook', webhookRoutes);
app.use('/pipelines', pipelineRoutes);

const start = async () => {
  try {
    await connectRedis();
    await initDB();
    app.listen(PORT, () => {
      console.log(`Ingestion service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
};

start();

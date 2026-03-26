const redis = require('redis');

let client;

const connectRedis = async () => {
  client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  client.on('error', (err) => console.error('Redis error:', err));
  client.on('connect', () => console.log('Redis connected'));

  await client.connect();
};

const publishEvent = async (channel, data) => {
  if (!client) throw new Error('Redis not connected');
  const result = await client.publish(channel, JSON.stringify(data));
  console.log(`Published to ${channel}, subscribers: ${result}`);
};

const setCache = async (key, value, ttl = 3600) => {
  if (!client) throw new Error('Redis not connected');
  await client.setEx(key, ttl, JSON.stringify(value));
};

const getCache = async (key) => {
  if (!client) throw new Error('Redis not connected');
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
};

module.exports = { connectRedis, publishEvent, setCache, getCache };

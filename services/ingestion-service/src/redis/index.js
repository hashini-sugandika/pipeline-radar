const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('Redis connected'));

const connectRedis = async () => {
  await client.connect();
};

const publishEvent = async (channel, data) => {
  await client.publish(channel, JSON.stringify(data));
};

const setCache = async (key, value, ttl = 3600) => {
  await client.setEx(key, ttl, JSON.stringify(value));
};

const getCache = async (key) => {
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
};

module.exports = { client, connectRedis, publishEvent, setCache, getCache };

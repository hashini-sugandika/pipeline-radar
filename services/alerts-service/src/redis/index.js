const redis = require('redis');

const subscriber = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

subscriber.on('error', (err) => console.error('Redis error:', err));

const connectRedis = async () => {
  await subscriber.connect();
  console.log('Redis connected');
};

module.exports = { subscriber, connectRedis };

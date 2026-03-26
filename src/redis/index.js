const redis = require('redis');

const subscriber = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

const publisher = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

subscriber.on('error', (err) => console.error('Redis subscriber error:', err));
publisher.on('error', (err) => console.error('Redis publisher error:', err));

const connectRedis = async () => {
  await subscriber.connect();
  await publisher.connect();
  console.log('Redis connected');
};

const publishEvent = async (channel, data) => {
  await publisher.publish(channel, JSON.stringify(data));
};

module.exports = { subscriber, publisher, connectRedis, publishEvent };

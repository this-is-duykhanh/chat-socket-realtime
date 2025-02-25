const redis = require('redis');


const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`
});


redisClient.on('error', (err) => console.log('Redis Client Error', err));

redisClient.on('ready', () => {
    console.log('Redis is ready');
});

const connectRedis = async () => {
    try {
        await redisClient.connect();
        const result = await redisClient.ping();
        console.log('Redis ping response:', result);
    } catch (err) {
        console.error('Error connecting to Redis:', err);
    }
};

module.exports = { redisClient, connectRedis };

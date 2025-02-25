const redis = require('redis');

require("dotenv").config();


const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`
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


redisClient.on('error', (err) => console.log('Redis Client Error', err));

redisClient.on('ready', () => {
    console.log('Redis is ready');
});

module.exports = { redisClient, connectRedis };

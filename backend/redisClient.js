const Redis = require('ioredis');

const REDIS_URI = process.env.REDIS_URI || 'redis://redis:6379';
const redis = new Redis(REDIS_URI);

redis.on('connect', () => {
    console.log('✅ ToonVault Redis Connected');
});

redis.on('error', (err) => {
    console.error('❌ Redis Error:', err);
});

module.exports = redis;

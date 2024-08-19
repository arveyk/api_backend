import redis from 'redis';

class RedisClient {
  constructor() {
    this.client = redis.createClient().on('error', (err) => console.log(err));
    this.client.connect();
  }

  isAlive() {
    return this.client.isReady;
  }

  async get(key) {
    const value = await this.client.get(key);
    return value;
  }

  async set(key, value, duration) {
    if (duration) {
      await this.client.set(key, JSON.stringify(value), { EX: duration });
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key) {
    await this.client.del(key);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;

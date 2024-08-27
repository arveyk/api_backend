const { createClient } = require('redis');
const { promisify } = require('util');
class RedisClient {
    constructor() {
    this.connectStatus = false;
    this.client = createClient().on('error', (err) => {
      console.log(err)
    });
    this.client.on('connect', () => {
      this.connectStatus = true;
    });
    this.client._events.connect();

  }
  
  isAlive() {
    return this.client.ready;
  }

  async get(key) {
    const getAsync = promisify(this.client.get).bind(this.client);
    const value = await getAsync(key);
    return value;
  }

  async set(key, value, duration) {
    try {
      const setexAsync = promisify(this.client.setex).bind(this.client);
      await setexAsync(key, duration, value);
      console.log(key, value, duration);
       /*(err, result) => {
        if (err) {
          console.error(err);
	} else {
	  console.debug(result);
	}
      });*/
    } catch (error) {
      console.error('setexError', error);
    }
  }
  async del(key) {
    const delAsync = promisify(this.client.del).bind(this.client);
    await delAsync(key);
  }
}
const redisClient = new RedisClient();
module.exports = redisClient;

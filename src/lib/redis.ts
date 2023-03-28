import Redis from 'ioredis';
import * as config from 'config';

export default new Redis(config.redis);

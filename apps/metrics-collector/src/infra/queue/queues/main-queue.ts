import { Queue } from 'bullmq'
import { RedisOptions } from 'ioredis'

const redisOptions: RedisOptions = {
  host: 'redis',
  port: 6379,
}

export const mainQueue = new Queue('mainQueue', { connection: redisOptions })

export default mainQueue

import { Queue } from 'bullmq'
import { RedisOptions } from 'ioredis'

const redisOptions: RedisOptions = {
  host: 'redis',
  port: 6379,
}

export const clientsQueue = new Queue('clientsQueue', { connection: redisOptions })

export default clientsQueue

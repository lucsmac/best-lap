import { Worker } from 'bullmq'
import { RedisOptions } from 'ioredis'
import { runChannelMetricsCollect } from '../../../handlers'

const redisOptions: RedisOptions = {
  host: 'redis',
  port: 6379
}

export const worker = new Worker(
  'mainQueue',
  runChannelMetricsCollect,
  {
    connection: redisOptions,
    limiter: {
      max: 30,
      duration: 60 * 1000, // 60 segundos
    }
  }
)

export const secondWorker = new Worker(
  'clientsQueue',
  runChannelMetricsCollect,
  {
    connection: redisOptions,
    limiter: {
      max: 30,
      duration: 60 * 1000, // 60 segundos
    }
  }
)

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} falhou com o erro: `, err)
})

worker.on('error', err => {
  console.error(err);
});

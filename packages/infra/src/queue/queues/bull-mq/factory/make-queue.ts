import { Queue } from 'bullmq'
import { redisOptions } from '../../../../redis/config';

export const makeQueue = (queueName: string): Queue => {
  return new Queue(queueName, { connection: redisOptions });
}

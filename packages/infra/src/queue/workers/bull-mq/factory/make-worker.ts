import { Worker } from 'bullmq'
import { redisOptions } from '../../../../redis/config'
import { QueueType } from '../../../queues/types/queue-type';

type MakeWorkerParams = {
  queueName: QueueType;
  processor: (job: any) => Promise<void>;
}

export const makeWorker = ({ queueName, processor }: MakeWorkerParams) => {
  const worker = new Worker(
    queueName,
    processor,
    {
      connection: redisOptions,
      limiter: {
        max: 30,
        duration: 60 * 1000 * 2,
      }
    }
  )

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} falhou com o erro: `, err)
  })

  worker.on('error', err => {
    console.error(err);
  });

  return worker;
}

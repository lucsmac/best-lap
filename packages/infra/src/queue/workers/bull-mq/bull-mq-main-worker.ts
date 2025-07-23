import { bullMqMainQueue } from "../../queues/bull-mq/bull-mq-main-queue";
import { QueueType } from "../../queues/types/queue-type";
import { makeWorker } from "./factory/make-worker";

export const bullMqMainWorker = makeWorker({
  queueName: bullMqMainQueue.name as QueueType,
  processor: async (job) => {
    // Implement the job processing logic here
    console.log(`Processing job ${job.id} in main worker`);
    // Example: await someAsyncFunction(job.data);
  },
})

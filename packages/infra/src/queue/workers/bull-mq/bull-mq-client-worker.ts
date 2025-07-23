import { bullMqClientsQueue } from "../../queues/bull-mq/bull-mq-client-queue";
import { makeWorker } from "./factory/make-worker";

export const bullMqClientWorker = makeWorker({
  queueName: bullMqClientsQueue.name,
  processor: async (job) => {
    // Implement the job processing logic here
    console.log(`Processing job ${job.id} in main worker`);
    // Example: await someAsyncFunction(job.data);
  },
})

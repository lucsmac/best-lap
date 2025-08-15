import { makeWorker } from "./factory/make-worker";
import { QueueType } from "../../queues/types/queue-type";
import { env } from "@best-lap/env";

type workerConfig = {
  queueName: QueueType;
  processor: (job: any) => Promise<void>;
}

export const setupWorkers = (workersConfig: workerConfig[]) => {
  workersConfig.forEach(({ queueName, processor }) => {
    makeWorker({
      queueName,
      processor,
      options: {
        concurrency: env.WORKER_CONCURRENCY
      }
    });

    console.log(`Worker for queue ${queueName} started successfully`);
  })
}

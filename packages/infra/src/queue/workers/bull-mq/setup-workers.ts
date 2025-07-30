import { makeWorker } from "./factory/make-worker";
import { QueueType } from "../../queues/types/queue-type";

type workerConfig = {
  queueName: QueueType;
  processor: (job: any) => Promise<void>;
}

export const setupWorkers = (workersConfig: workerConfig[]) => {
  workersConfig.forEach(({ queueName, processor }) => {
    makeWorker({
      queueName,
      processor,
    });

    console.log(`Worker for queue ${queueName} started successfully`);
  })
}

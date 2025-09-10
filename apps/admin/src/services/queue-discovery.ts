import { Queue } from "bullmq";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import type Redis from "ioredis";

export class QueueDiscoveryService {
  constructor(private readonly connection: Redis) {}

  async discoverQueues(): Promise<BullMQAdapter[]> {
    try {
      const keys = await this.connection.keys('bull:*:meta');
      const queueNames = keys
        .map(key => key.split(':')[1])
        .filter((name, index, arr) => arr.indexOf(name) === index);

      console.log('Found queues:', queueNames);

      const queues = queueNames.map(name => {
        const queue = new Queue(name, { connection: this.connection });
        return new BullMQAdapter(queue);
      });

      return queues;
    } catch (error) {
      console.error('Error discovering queues:', error);
      return [];
    }
  }
}
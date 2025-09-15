import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { FastifyAdapter } from "@bull-board/fastify";
import { Queue } from "bullmq";
import Redis from "ioredis";

export async function setupQueues(connection: Redis, serverAdapter: FastifyAdapter) {
  try {
    const keys = await connection.keys('bull:*:meta');
    const queueNames = keys
      .map(key => key.split(':')[1])
      .filter((name, index, arr) => arr.indexOf(name) === index);

    console.log('Found queues:', queueNames);

    const queues = queueNames.map(name => {
      const queue = new Queue(name, { connection });
      return new BullMQAdapter(queue);
    });

    createBullBoard({
      queues,
      serverAdapter,
    });

    return queues;
  } catch (error) {
    console.error('Error setting up queues:', error);
    return [];
  }
}
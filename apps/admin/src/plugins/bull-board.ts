import { createBullBoard } from "@bull-board/api";
import { FastifyAdapter } from "@bull-board/fastify";
import type { FastifyInstance } from "fastify";
import { QueueDiscoveryService } from "../services/queue-discovery";
import { createRedisConnection } from "../config/redis";

export const bullBoardPlugin = async (app: FastifyInstance) => {
  const serverAdapter = new FastifyAdapter();
  const connection = createRedisConnection();
  const queueDiscovery = new QueueDiscoveryService(connection);

  const queues = await queueDiscovery.discoverQueues();

  createBullBoard({
    queues,
    serverAdapter,
  });

  serverAdapter.setBasePath('/');
  
  await app.register(serverAdapter.registerPlugin(), {
    prefix: '/',
  });

  // Clean up Redis connection when Fastify shuts down
  app.addHook('onClose', async () => {
    await connection.quit();
  });
};
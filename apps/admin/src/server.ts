import Fastify from 'fastify';
import { FastifyAdapter } from '@bull-board/fastify';
import { setupQueues } from './utils/setup-queues';
import { connection } from './utils/connection';
import { loggerConfig } from './config';
import { env } from '@best-lap/env';

async function startAdminServer() {
  const fastify = Fastify({
    logger: loggerConfig
  });

  const serverAdapter = new FastifyAdapter();

  await setupQueues(connection, serverAdapter);

  await fastify.register(serverAdapter.registerPlugin(), {
    prefix: '/',
  });

  const PORT = env.ADMIN_PORT || 4000;

  fastify.listen({ port: PORT, host: '0.0.0.0' })
    .then(() => {
      console.log(`Bull Board Admin running on http://localhost:${PORT} 🚀`);
    })
    .catch((err) => {
      fastify.log.error(err);
      process.exit(1);
    });
}

startAdminServer().catch(err => {
  console.error('Error starting Bull Board Admin:', err);
  process.exit(1);
});

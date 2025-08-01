import Fastify from 'fastify';
import { FastifyAdapter } from '@bull-board/fastify';
import { setupQueues } from './utils/setup-queues';
import { connection } from './utils/connection';

const setupBullBoard = async () => {
  const fastify = Fastify({ logger: true });

  const serverAdapter = new FastifyAdapter();

  await setupQueues(connection, serverAdapter);

  await fastify.register(serverAdapter.registerPlugin(), {
    prefix: '/',
  });

  const PORT = parseInt(process.env.BULL_BOARD_PORT || '4000');
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`Bull Board running on http://localhost:${PORT}`);
}

setupBullBoard().catch(err => {
  console.error('Error starting Bull Board:', err);
  process.exit(1);
});

import 'reflect-metadata';
import 'dotenv/config';
import Fastify from 'fastify';
import { bullBoardPlugin } from './plugins/bull-board';

const createServer = () => {
  const fastify = Fastify({ 
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  return fastify;
};

const startServer = async () => {
  const app = createServer();

  try {
    await app.register(bullBoardPlugin);

    const port = parseInt(process.env.ADMIN_PORT || '4000');
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });
    
    console.log(`🚀 Admin panel running on http://localhost:${port}`);
    console.log(`📊 Bull Board dashboard available at http://localhost:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Error starting server:', err);
    process.exit(1);
  });
}

export { createServer };
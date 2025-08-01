import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export default fp(async function bullBoardProxy(fastify: FastifyInstance) {

  // Proxy para API do Bull Board (/api/*)
  fastify.all('/api/*', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const targetUrl = `${process.env.BULL_BOARD_URL || 'http://localhost:4000'}${request.url}`;

      const response = await fetch(targetUrl, {
        method: request.method,
        headers: {
          'content-type': request.headers['content-type'] || 'application/json',
        },
        body: request.method !== 'GET' && request.method !== 'HEAD'
          ? JSON.stringify(request.body)
          : undefined,
      });

      const contentType = response.headers.get('content-type') || 'application/json';

      if (contentType.includes('application/json')) {
        const data = await response.json();
        return reply.type('application/json').send(data);
      }

      const data = await response.text();
      return reply
        .code(response.status)
        .type(contentType)
        .send(data);

    } catch (error) {
      fastify.log.error('Bull Board API proxy error:', error);
      return reply.code(503).send({ error: 'API unavailable' });
    }
  });

  // Proxy para assets estáticos (/static/*)
  fastify.all('/static/*', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const targetUrl = `${process.env.BULL_BOARD_URL || 'http://localhost:4000'}${request.url}`;

      const response = await fetch(targetUrl, {
        method: request.method,
      });

      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const data = await response.arrayBuffer();

      return reply
        .code(response.status)
        .type(contentType)
        .send(Buffer.from(data));

    } catch (error) {
      fastify.log.error('Static asset proxy error:', error);
      return reply.code(404).send('Asset not found');
    }
  });

  // Proxy para páginas do Bull Board (/admin/queues/*)
  fastify.all('/admin/queues/*', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      let targetPath = request.url.replace('/admin/queues', '') || '/';

      const targetUrl = `${process.env.BULL_BOARD_URL || 'http://localhost:4000'}${targetPath}`;

      const response = await fetch(targetUrl, {
        method: request.method,
        headers: {
          'content-type': request.headers['content-type'] || 'text/html',
        },
        body: request.method !== 'GET' && request.method !== 'HEAD'
          ? JSON.stringify(request.body)
          : undefined,
      });

      const contentType = response.headers.get('content-type') || 'text/html';

      if (contentType.includes('text/html')) {
        const html = await response.text();
        return reply.type('text/html').send(html);
      }

      const data = await response.arrayBuffer();
      return reply
        .code(response.status)
        .type(contentType)
        .send(Buffer.from(data));

    } catch (error) {
      fastify.log.error('Bull Board proxy error:', error);
      return reply.code(503).send({ error: 'Bull Board service unavailable' });
    }
  });

  // Rota raiz do admin
  fastify.get('/admin/queues', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response = await fetch(`${process.env.BULL_BOARD_URL || 'http://localhost:4000'}/`);
      const html = await response.text();

      return reply
        .type('text/html')
        .send(html);
    } catch (error) {
      fastify.log.error('Bull Board root proxy error:', error);
      return reply.code(503).send({ error: 'Bull Board unavailable' });
    }
  });
});

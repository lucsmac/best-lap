import 'reflect-metadata';
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { env } from '@best-lap/env'

import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { appRoutes } from './http/routes';
import { swaggerConfig } from './docs/config';

import { connectToDatabase } from '@best-lap/infra';
import { loggerConfig } from './config';

async function startServer() {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Erro ao conectar com banco:', error);
    process.exit(1);
  }

  const server = Fastify({
    logger: loggerConfig,
    ajv: {
      customOptions: {
        removeAdditional: 'all',
        coerceTypes: true,
        useDefaults: true
      }
    }
  }).withTypeProvider<ZodTypeProvider>();

  server.register(import('@fastify/cors'));

  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  server.register(fastifySwagger, swaggerConfig);
  server.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    staticCSP: false,
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (_request, reply, next) {
        reply.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
        reply.header('Origin-Agent-Cluster', '?0');
        next();
      }
    }
  });

  server.register(import('@fastify/helmet'), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    }
  });

  server.register(appRoutes);

  server.listen({ port: env.API_PORT, host: '0.0.0.0' })
    .then(() => {
      console.log(`Application is running at port ${env.API_PORT}! 🚀`);
    })
    .catch((err) => {
      server.log.error(err);
      process.exit(1);
    });
}

startServer();

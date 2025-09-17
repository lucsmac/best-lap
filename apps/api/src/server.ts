import 'reflect-metadata';
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { env } from '@best-lap/env'

import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { appRoutes } from './http/routes';
import { swaggerConfig } from './docs/config';

// Types for Swagger transformation
interface SwaggerServer {
  url: string;
  description?: string;
}

interface SwaggerObject {
  servers?: SwaggerServer[];
  [key: string]: any;
}

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

  // Register Swagger before Helmet to avoid CSP conflicts
  server.register(fastifySwagger, swaggerConfig);
  server.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    staticCSP: false,
    transformStaticCSP: false,
    transformSpecification: (swaggerObject: SwaggerObject, req) => {
      // Detect protocol using universal headers (works with any proxy/load balancer)
      const protocol = env.FORCE_HTTP_SWAGGER ? 'http' :
        req.headers['x-forwarded-proto'] ||
        (req.headers['x-forwarded-ssl'] === 'on' ? 'https' : 'http') ||
        req.protocol || 'http';

      const host = req.headers.host;

      if (host) {
        // Create current server dynamically
        const currentServer: SwaggerServer = {
          url: `${protocol}://${host}`,
          description: 'Current server'
        };

        // Create a mutable copy to modify
        const mutableSwaggerObject = { ...swaggerObject };

        // Put current server first in the list (Swagger UI uses first server as default)
        mutableSwaggerObject.servers = [
          currentServer,
          ...(swaggerObject.servers || []).filter((server: SwaggerServer) =>
            !server.url.includes(host)
          )
        ];

        return mutableSwaggerObject;
      }

      return swaggerObject;
    },
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    }
  });

  server.register(import('@fastify/helmet'), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "http:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "http:", "https:"],
        imgSrc: ["'self'", "data:", "http:", "https:"],
        connectSrc: ["'self'", "http:", "https:"],
        fontSrc: ["'self'", "data:", "http:", "https:"],
        mediaSrc: ["'self'", "http:", "https:"]
      }
    },
    crossOriginOpenerPolicy: false,
    originAgentCluster: false
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

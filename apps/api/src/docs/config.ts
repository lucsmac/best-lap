import { env } from "@best-lap/env";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

export const swaggerConfig = {
  openapi: {
    info: {
      title: 'Best Lap',
      description: 'API for collecting and analyzing performance metrics',
      version: '1.0.0',
      contact: {
        name: 'Autoforce',
        email: 'desenvolvimento@autoforce.com.br'
      }
    },
    servers: [
      {
        url: 'http://ec2-75-101-196-198.compute-1.amazonaws.com:3333',
        description: 'EC2 deployment server (HTTP)'
      },
      {
        url: 'http://75.101.196.198:3333',
        description: 'EC2 deployment server (IP)'
      },
      {
        url: `http://localhost:${env.API_PORT}`,
        description: 'Local development server'
      },
      {
        url: 'https://api-staging.autoforce.com.br',
        description: 'Staging environment (work in progress)'
      },
      {
        url: 'https://api.autoforce.com.br',
        description: 'Production environment (work in progress)'
      }
    ],
  },
  transform: jsonSchemaTransform,
}
  
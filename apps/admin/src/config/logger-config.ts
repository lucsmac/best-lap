import type { FastifyLoggerOptions } from 'fastify/types/logger'
import { env } from '@best-lap/env'

const isProduction = env.NODE_ENV === 'production'

export const loggerConfig: FastifyLoggerOptions = {
  level: env.LOG_LEVEL || 'info',
  ...(!isProduction && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname'
      }
    }
  })
}
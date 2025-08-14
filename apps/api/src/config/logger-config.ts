import { env } from '@best-lap/env';

const isDevelopment = env.NODE_ENV !== 'production';

const developmentConfig = {
  transport: {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
  },
}
const productionConfig = true

export const loggerConfig = isDevelopment ? developmentConfig : productionConfig

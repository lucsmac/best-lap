import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    API_PORT: z.coerce.number().default(3333),
    NODE_ENV: z.enum(['development', 'test', 'production']),

    BULL_BOARD_PORT: z.coerce.number().default(4000),

    DB_HOST: z.string(),
    DB_PORT: z.coerce.number().default(5432),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),

    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_HOST: z.string().default('localhost'),

    GOOGLE_API_KEY: z.string().optional(),
  },
  client: {},
  shared: {},
  runtimeEnv: {
    API_PORT: process.env.SERVER_PORT,
    NODE_ENV: process.env.NODE_ENV,

    BULL_BOARD_PORT: process.env.BULL_BOARD_PORT,

    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,

    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_HOST: process.env.REDIS_HOST,

    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  },
  emptyStringAsUndefined: true,
})
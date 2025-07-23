import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    API_PORT: z.coerce.number().default(3333),
    DATABASE_URL: z.url(),
    NODE_ENV: z.enum(['development', 'test', 'production']),

    DB_HOST: z.string(),
    DB_PORT: z.coerce.number().default(5432),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),

    GOOGLE_API_KEY: z.string().optional(),
  },
  client: {},
  shared: {},
  runtimeEnv: {
    API_PORT: process.env.SERVER_PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,

    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,

    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  },
  emptyStringAsUndefined: true,
})
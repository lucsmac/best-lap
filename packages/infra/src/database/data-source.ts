import 'dotenv/config';
import { DataSource } from 'typeorm';
import { env } from '@best-lap/env';
import path from 'path';

const rootFolder = env.NODE_ENV === 'development' ? 'src' : 'dist';

export const dataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: 5432,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: true,
  migrationsTransactionMode: 'each',
  entities: [
    path.resolve(__dirname, `../../${rootFolder}/typeorm/entities/*.{ts,js}`)
  ],
  migrations: [
    path.resolve(__dirname, `../../${rootFolder}/database/migration/*.{ts,js}`)
  ]
});

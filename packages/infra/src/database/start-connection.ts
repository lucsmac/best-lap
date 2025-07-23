import { dataSource } from './data-source';

export const startConnection = async () => {
  await dataSource.initialize()
    .then(async () => {
      await dataSource.runMigrations();
      console.log('Database has been initialized')
    })
    .catch((err: unknown) => {
      console.error('Error during Database initialization. Error: ', err)
    })
}

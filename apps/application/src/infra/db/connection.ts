import { dataSource } from './data-source';

export const connection = async () => {
  await dataSource.initialize()
    .then(async () => {
      await dataSource.runMigrations();
      console.log('Database has been initialized')
    })
    .catch((err) => {
      console.error('Error during Database initialization. Error: ', err)
    })
}

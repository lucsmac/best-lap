import { dataSource } from './data-source';

export const connectToDatabase = async () => {

  if (!dataSource.isInitialized) {
    try {
      await dataSource.initialize()
      await dataSource.runMigrations();
    } catch (err) {
      console.error('Error during Database initialization. Error: ', err)
      throw err;
    }
  } else {
    console.log('Database is already initialized', dataSource);
  }

  return dataSource
}

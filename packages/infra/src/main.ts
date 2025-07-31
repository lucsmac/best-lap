import 'reflect-metadata'
import { connectToDatabase } from './database/start-connection';

connectToDatabase().then(() => {
  console.log('Database connection established successfully.');
}).catch((error) => {
  console.error('Error connecting to the database:', error);
  process.exit(1);
});

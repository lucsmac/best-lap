import 'reflect-metadata'
import { startConnection } from './database/start-connection';
import { startWorkers } from './queue/workers/bull-mq/start-workers';

startConnection()
startWorkers()

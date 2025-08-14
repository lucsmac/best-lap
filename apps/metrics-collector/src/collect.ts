import { connectToDatabase } from '@best-lap/infra';
import { collectMetrics } from './jobs/collect-metrics'

async function initCollect() {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Erro ao conectar com banco:', error);
    process.exit(1);
  }

  try {
    console.log('starting collect')
    await collectMetrics()
    console.log('collecting...')
  } catch (err) {
    console.log("error during executino: ", err)
  }
}

initCollect();

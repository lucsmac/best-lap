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
    console.log('collect completed successfully')
    process.exit(0)
  } catch (err) {
    console.log("error during execution: ", err)
    process.exit(1)
  }
}

initCollect();

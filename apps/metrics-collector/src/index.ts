import { metricsWorkersConfig } from "./config/queues/workers-config";
import { collectMetricsCron } from "./jobs/cron/collect-metrics-cron";
import { connectToDatabase, setupWorkers } from "@best-lap/infra";

async function initCollectMetricsCron() {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Erro ao conectar com banco:', error);
    process.exit(1);
  }

  try {
    setupWorkers(metricsWorkersConfig);
    collectMetricsCron();
  } catch (err) {
    console.log("error during executino: ", err)
  }
}

initCollectMetricsCron()

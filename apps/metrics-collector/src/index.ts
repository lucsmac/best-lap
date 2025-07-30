import { metricsWorkersConfig } from "./config/queues/workers-config";
import { collectMetricsCron } from "./jobs/cron/collect-metrics-cron";
import { setupWorkers } from "@best-lap/infra";

setupWorkers(metricsWorkersConfig);
collectMetricsCron();

import cron from 'node-cron';
import { collectMetrics } from '../collect-metrics';
import { env } from '@best-lap/env';

export const collectMetricsCron = () => {
  cron.schedule(env.COLLECT_METRICS_CRON_EXPRESSION, collectMetrics)
}

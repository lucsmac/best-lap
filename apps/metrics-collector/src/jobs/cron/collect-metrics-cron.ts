import cron from 'node-cron';
import { collectMetrics } from '../collect-metrics';

export const collectMetricsCron = () => {
  cron.schedule('0 8,14,20 * * *', collectMetrics)
}

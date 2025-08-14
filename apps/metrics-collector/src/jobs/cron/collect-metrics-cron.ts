import cron from 'node-cron';
import { makeCollectPageMetricsDispatcher } from '../../factories';

export const collectMetricsCron = () => {
  cron.schedule('0 8,14,20 * * *', async () => {
    const collectMetricsJobDispatcher = makeCollectPageMetricsDispatcher()
    await collectMetricsJobDispatcher.execute();
  });
}

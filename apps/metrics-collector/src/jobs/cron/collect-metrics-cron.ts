import cron from 'node-cron';
import { makeCollectPageMetricsDispatcher } from '../../factories';

export const collectMetricsCron = () => {
  cron.schedule('*/30 * * * *', async () => {
    const collectMetricsJobDispatcher = makeCollectPageMetricsDispatcher()
    await collectMetricsJobDispatcher.execute();
  });
}

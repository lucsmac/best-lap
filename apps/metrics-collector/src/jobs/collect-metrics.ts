import { makeCollectPageMetricsDispatcher } from "../factories";

export const collectMetrics = async () => {
  const collectMetricsJobDispatcher = makeCollectPageMetricsDispatcher()
  await collectMetricsJobDispatcher.execute();
};

import { TypeormChannelsRepository, BullMqMetricsQueue } from "@best-lap/infra";
import { CollectPageMetricsDispatcher } from "../services";

export const MakeCollectPageMetricsDispatcher = async () => {
  try {
    const channelsRepository = new TypeormChannelsRepository()
    const metricsQueue = new BullMqMetricsQueue();
    const collectPageMetricsDispatcher = new CollectPageMetricsDispatcher(channelsRepository, metricsQueue)

    await collectPageMetricsDispatcher.execute();
  } catch (error) {
    console.error(`Error during set up of collect page metrics`, error);
  }
}

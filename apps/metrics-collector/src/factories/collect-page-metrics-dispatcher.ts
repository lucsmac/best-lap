import { TypeormChannelsRepository, BullMqPageMetricsQueue, bullMqClientsQueue, bullMqMainQueue } from "@best-lap/infra";
import { CollectPageMetricsDispatcher } from "../services";

export const makeCollectPageMetricsDispatcher = () => {
  const channelsRepository = new TypeormChannelsRepository()

  const queuesMap = {
    reference: bullMqMainQueue,
    client: bullMqClientsQueue
  }
  const pageMetricsQueue = new BullMqPageMetricsQueue(queuesMap);

  const collectPageMetricsDispatcher = new CollectPageMetricsDispatcher(channelsRepository, pageMetricsQueue)

  return collectPageMetricsDispatcher;
}

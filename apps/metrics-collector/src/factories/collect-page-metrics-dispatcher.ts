import { TypeormChannelsRepository, BullMqPageMetricsQueue } from "@best-lap/infra";
import { CollectPageMetricsDispatcher } from "../services";
import { queuesMap } from "../config/queues/map";

export const makeCollectPageMetricsDispatcher = () => {
  const channelsRepository = new TypeormChannelsRepository()

  const pageMetricsQueue = new BullMqPageMetricsQueue(queuesMap);

  const collectPageMetricsDispatcher = new CollectPageMetricsDispatcher(channelsRepository, pageMetricsQueue)

  return collectPageMetricsDispatcher;
}

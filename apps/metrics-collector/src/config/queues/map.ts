import { bullMqClientsQueue, bullMqMainQueue } from "@best-lap/infra";

export const queuesMap = {
  reference: bullMqMainQueue,
  client: bullMqClientsQueue
}
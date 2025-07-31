import { makeQueue } from "@best-lap/infra"

const bullMqMainQueue = makeQueue('reference')
const bullMqClientsQueue = makeQueue('client')

export const queuesMap = {
  reference: bullMqMainQueue,
  client: bullMqClientsQueue
}
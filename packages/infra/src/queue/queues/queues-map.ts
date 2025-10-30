import { makeQueue } from "./bull-mq"

const bullMqMainQueue = makeQueue('reference')
const bullMqClientsQueue = makeQueue('client')

export const queuesMap = {
  reference: bullMqMainQueue,
  client: bullMqClientsQueue
}

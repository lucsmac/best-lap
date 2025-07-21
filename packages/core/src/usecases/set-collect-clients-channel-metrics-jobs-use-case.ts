// // import { JobsOptions } from "bullmq";
// import { AddChannelsPerformanceMetricsJobs } from "../../../../apps/metrics-collector/src/services";
// import { clientsQueue } from "@/infra/queue/queues";
// import { chunkArray } from "../utils/chunk-array";
// import { ChannelEntity, ChannelsRepository } from "../modules";

// export class SetCollectClientsChannelMetricsJobsUseCase {
//   constructor(private channelsRepository: ChannelsRepository) { }

//   async execute() {
//     const clientsChannelsList: ChannelEntity[] = await this.channelsRepository.listAllClients() as ChannelEntity[]

//     if (!clientsChannelsList || clientsChannelsList.length === 0) {
//       console.log('No clients channels available to collect metrics.')

//       return
//     }

//     const chunkedChannelsArray = chunkArray(clientsChannelsList, 150)

//     chunkedChannelsArray.forEach((channelsChunk, index) => {
//       // const customConfig: JobsOptions = {
//       //   repeat: {
//       //     pattern: `${index * 5} */3 * * *`,
//       //     utc: true
//       //   }
//       // }

//       const addChannelsPerformanceMetricsJobs =
//         new AddChannelsPerformanceMetricsJobs()

//       addChannelsPerformanceMetricsJobs
//         .execute(channelsChunk, customConfig, { queue: clientsQueue })
//     })
//   }
// }

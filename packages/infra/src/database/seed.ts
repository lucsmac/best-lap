// import "reflect-metadata"
// import { connection } from './connection'
// import { ChannelEntity } from "../../modules/channel/entity/channel-entity.interface"
// import { getThemesData } from "../../utils/get-themes-data";

// export async function seedDb() {
//   try {
//     const channelsSeedData: ChannelEntity[] = await getThemesData()
//     const channelRepository = new TypeormChannelsRepository();

//     channelsSeedData.forEach((channelData: ChannelEntity) => {
//       channelRepository.create(channelData)
//     })

//     console.log(`Database was seeded with ${channelsSeedData.length} channels`)
//   } catch(error) {
//     console.error(`Error when seed database * Error message: ${error}`)
//   }
// }

// connection()
//   .then(() => {
//     seedDb()
//   })
